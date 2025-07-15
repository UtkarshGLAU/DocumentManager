const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Document = require("../models/Document");
const googleDriveService = require("../services/googleDriveService");

// Multer config for memory storage (since we're uploading to Google Drive)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit (increased from 50MB)
  },
  fileFilter: (req, file, cb) => {
    // Optional: Add file type restrictions
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only specific file types are allowed!'));
    }
  }
});

// POST /api/docs/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  const { uid, email, name, role, accessToken } = req.body;
  
  // Only users (not guests) can upload files
  if (role !== "user" && role !== "admin") {
    return res.status(403).json({ error: "Only users with drive permission can upload files" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const latest = await Document.findOne({
      originalName: req.file.originalname,
      "uploader.uid": uid, // Only check versions for same user
    }).sort({ version: -1 });

    const newVersion = latest ? latest.version + 1 : 1;
    const isPrivate = req.body.isPrivate === "true";

    const tags = req.body.tags
      ? req.body.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const uniqueFileName = uniqueSuffix + path.extname(req.file.originalname);

    try {
      console.log('🔍 Debug: Upload request analysis...');
      console.log('🔍 Access token received:', accessToken ? 'YES' : 'NO');
      console.log('🔍 User role:', role);
      console.log('🔍 Token length:', accessToken ? accessToken.length : 0);
      console.log('🔍 Token type:', accessToken ? (accessToken.startsWith('eyJ') ? 'Firebase ID Token' : 'OAuth Access Token') : 'None');
      
      // Initialize Google Drive service
      await googleDriveService.initialize(accessToken);
      
      const driveFile = await googleDriveService.uploadFile(
        req.file.buffer,
        uniqueFileName,
        req.file.mimetype
      );

      const newDoc = new Document({
        filename: uniqueFileName,
        originalName: req.file.originalname,
        uploader: { uid, email, name },
        version: newVersion,
        googleDriveFileId: driveFile.fileId,
        googleDriveViewLink: driveFile.webViewLink,
        googleDriveDownloadLink: driveFile.downloadLink,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        storageType: 'gdrive',
        isPrivate,
        tags,
      });

      await newDoc.save();

      res.status(201).json({
        message: "Document uploaded successfully to Google Drive",
        document: newDoc,
      });
      
    } catch (driveError) {
      console.error('❌ Google Drive upload failed:', driveError.message);
      res.status(500).json({ 
        error: "Upload failed: " + driveError.message,
        details: "Google Drive upload is required. Please ensure you have granted Google Drive permissions during login."
      });
    }
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: "Upload failed: " + err.message });
  }
});
// GET /api/docs/all
router.get("/all", async (req, res) => {
  const { uid, role } = req.query;

  try {
    let query = {};
    
    if (role === 'admin') {
      // Admins can see all documents
      query = {};
    } else if (role === 'user') {
      // Users can see public documents and their own private documents
      query = {
        $or: [
          { isPrivate: false },
          { "uploader.uid": uid }
        ]
      };
    } else {
      // Guests can only see public documents
      query = { isPrivate: false };
    }

    const docs = await Document.find(query).sort({ uploadDate: -1 });

    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});
// DELETE /api/docs/:id
router.delete("/:id", async (req, res) => {
  const { uid, role } = req.query;
  const { accessToken } = req.body;

  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Check permissions: users can only delete their own files, admins can delete any
    if (role === 'user' && doc.uploader.uid !== uid) {
      return res.status(403).json({ error: "You can only delete your own files" });
    }
    
    if (role === 'guest') {
      return res.status(403).json({ error: "Guests cannot delete files" });
    }

    if (role !== 'admin' && role !== 'user') {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    console.log('🔍 Delete request analysis...');
    console.log('🔍 Document storage type:', doc.storageType);
    console.log('🔍 Google Drive file ID:', doc.googleDriveFileId || 'None');
    console.log('🔍 Access token received:', accessToken ? 'YES' : 'NO');
    console.log('🔍 User role:', role);
    console.log('🔍 Document owner:', doc.uploader.uid);
    console.log('🔍 Requesting user:', uid);

    // Delete from Google Drive (all files are now stored in Google Drive)
    if (doc.googleDriveFileId) {
      try {
        console.log('🗑️ Attempting to delete from Google Drive...');
        await googleDriveService.initialize(accessToken);
        await googleDriveService.deleteFile(doc.googleDriveFileId);
        console.log(`✅ Deleted file from Google Drive: ${doc.googleDriveFileId}`);
      } catch (driveError) {
        console.error("❌ Google Drive delete failed:", driveError.message);
        // Continue with database deletion even if Drive deletion fails
        // This ensures the document record is still removed from the database
      }
    } else {
      console.warn("⚠️ No Google Drive file ID found for document");
    }

    await doc.deleteOne();
    console.log('✅ Document deleted from database');
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;

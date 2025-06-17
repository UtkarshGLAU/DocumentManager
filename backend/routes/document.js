const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Document = require("../models/Document");
const fs = require("fs");

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// POST /api/docs/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  const { uid, email, name, isAdmin } = req.body;
  if (isAdmin !== "true") return res.status(403).json({ error: "Forbidden" });

  try {
    const latest = await Document.findOne({
      originalName: req.file.originalname,
    }).sort({ version: -1 });

    const newVersion = latest ? latest.version + 1 : 1;

    const isPrivate = req.body.isPrivate === "true";

    const tags = req.body.tags
      ? req.body.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
    
    const newDoc = new Document({
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploader: { uid, email, name },
      version: newVersion,
      path: req.file.path,
      isPrivate,
      tags,
    });

    await newDoc.save();
    res.status(200).json({ message: "New version uploaded", document: newDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});
// GET /api/docs/all
router.get("/all", async (req, res) => {
  const { uid, isAdmin } = req.query;

  try {
    const docs = await Document.find({
      $or: [
        { isPrivate: false },
        { "uploader.uid": uid },
        ...(isAdmin === "true" ? [{}] : []),
      ],
    }).sort({ uploadDate: -1 });

    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});
// DELETE /api/docs/:id
router.delete("/:id", async (req, res) => {
  const { isAdmin } = req.query;

  if (isAdmin !== "true") return res.status(403).json({ error: "Forbidden" });

  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Delete file from disk
    const filePath = path.join(__dirname, "../uploads", doc.filename);
    fs.unlink(filePath, (err) => {
      if (err) console.warn("File delete failed:", err.message);
    });

    await doc.deleteOne();
    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;

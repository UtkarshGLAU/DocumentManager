const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  originalName: String,
  filename: String,
  path: String, // Keep for backward compatibility
  // Google Drive specific fields
  googleDriveFileId: String,
  googleDriveViewLink: String,
  googleDriveDownloadLink: String,
  mimeType: String,
  fileSize: Number,
  storageType: { type: String, enum: ['local', 'gdrive'], default: 'gdrive' },
  uploader: {
    uid: String,
    email: String,
    name: String,
  },
  tags: { type: [String], default: [] },
  groupId: { type: String },
  isPrivate: { type: Boolean, default: false },
  uploadDate: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
});

module.exports = mongoose.model("Document", documentSchema);

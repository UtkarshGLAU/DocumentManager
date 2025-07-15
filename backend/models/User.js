// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: String,
  email: String,
  name: String,
  photo: String,
  isAdmin: { type: Boolean, default: false },
  role: { 
    type: String, 
    enum: ['guest', 'user', 'admin'], 
    default: 'guest' 
  },
  hasDrivePermission: { type: Boolean, default: false },
  drivePermissionGrantedAt: { type: Date },
});

module.exports = mongoose.model("User", userSchema);

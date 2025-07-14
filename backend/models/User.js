// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: String,
  email: String,
  name: String,
  photo: String,
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);

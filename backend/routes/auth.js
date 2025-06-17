// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { uid, email, name, photo } = req.body;

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({ uid, email, name, photo });
      await user.save();
    }

    
    res.json({ isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

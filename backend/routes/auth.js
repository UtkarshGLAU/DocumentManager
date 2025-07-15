// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { uid, email, name, photo, hasGoogleDriveAccess } = req.body;

  console.log('🔍 Login request received:', {
    uid,
    email,
    hasGoogleDriveAccess
  });

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      // Create new user with default guest role
      user = new User({ 
        uid, 
        email, 
        name, 
        photo,
        role: 'guest',
        hasDrivePermission: hasGoogleDriveAccess || false
      });
      
      if (hasGoogleDriveAccess) {
        user.role = 'user';
        user.drivePermissionGrantedAt = new Date();
        console.log('✅ New user created with drive access - role: user');
      } else {
        console.log('👤 New user created without drive access - role: guest');
      }
      
      await user.save();
    } else {
      // For existing users, check if they have drive permission in database
      // This handles cases where user had permission before but token was cleared
      if (hasGoogleDriveAccess || user.hasDrivePermission) {
        user.hasDrivePermission = true;
        user.drivePermissionGrantedAt = user.drivePermissionGrantedAt || new Date();
        
        // Upgrade from guest to user if they have drive permission
        if (user.role === 'guest') {
          user.role = 'user';
          console.log('⬆️ User upgraded from guest to user based on stored permission');
        }
        
        await user.save();
      } else if (!hasGoogleDriveAccess && user.hasDrivePermission) {
        // Only downgrade if user explicitly doesn't have drive access
        user.hasDrivePermission = false;
        if (user.role === 'user') {
          user.role = 'guest';
          console.log('⬇️ User downgraded from user to guest - drive permission revoked');
        }
        await user.save();
      }
      
      console.log('➡️ User final state - role:', user.role, 'hasDrivePermission:', user.hasDrivePermission);
    }

    const response = { 
      isAdmin: user.isAdmin,
      role: user.role,
      hasDrivePermission: user.hasDrivePermission
    };
    
    console.log('📤 Login response:', response);
    res.json(response);
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/grant-drive-permission
router.post("/grant-drive-permission", async (req, res) => {
  const { uid } = req.body;

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.hasDrivePermission = true;
    user.drivePermissionGrantedAt = new Date();
    
    // Upgrade from guest to user
    if (user.role === 'guest') {
      user.role = 'user';
    }
    
    await user.save();

    res.json({ 
      success: true,
      role: user.role,
      hasDrivePermission: user.hasDrivePermission
    });
  } catch (err) {
    console.error('Grant permission error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

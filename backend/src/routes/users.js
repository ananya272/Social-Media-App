const express = require('express');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

// PATCH /users/me - Update current user's profile
router.patch('/me', auth, async (req, res) => {
  try {
    const updates = {};
    if (req.body.bio !== undefined) updates.bio = req.body.bio;
    if (req.body.profilePic !== undefined) updates.profilePic = req.body.profilePic;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true, select: '-password' }
    );
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

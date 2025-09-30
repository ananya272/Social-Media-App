const express = require('express');
const auth = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

const router = express.Router();

// GET /notifications - list current user's notifications (newest first)
router.get('/', auth, async (req, res) => {
  try {
    const items = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('fromUser', 'username profilePic')
      .populate('postId', 'text');
    res.json(items);
  } catch (err) {
    console.error('List notifications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

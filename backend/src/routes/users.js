const express = require('express');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Post = require('../models/Post');
const router = express.Router();

// GET /users/:id - Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers following', 'username profilePic');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /users/:id - Update user profile (auth required)
router.patch('/:id', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updates = {};
    if (req.body.bio !== undefined) updates.bio = req.body.bio;
    if (req.body.profilePic !== undefined) updates.profilePic = req.body.profilePic;
    if (req.body.username !== undefined) updates.username = req.body.username;
    if (req.body.email !== undefined) updates.email = req.body.email;

    const user = await User.findByIdAndUpdate(
      req.params.id,
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

// GET /users/:id/posts - Get posts by user
router.get('/:id/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username profilePic')
      .populate('comments.userId', 'username profilePic');

    const total = await Post.countDocuments({ userId: req.params.id });
    const totalPages = Math.ceil(total / limit);

    res.json({
      posts,
      currentPage: page,
      totalPages,
      totalPosts: total
    });
  } catch (err) {
    console.error('Get user posts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /users/me - Update current user's profile (kept for backward compatibility)
router.patch('/me', auth, async (req, res) => {
  req.params.id = req.user.id;
  const route = router.routes.find(r => r.path === '/:id' && r.method === 'patch');
  route.stack[0].handle(req, res);
});

module.exports = router;

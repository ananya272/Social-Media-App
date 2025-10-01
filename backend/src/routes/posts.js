const express = require('express');
const auth = require('../middleware/authMiddleware');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const router = express.Router();

// GET /posts - get all posts with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email profilePic')
      .populate('comments.userId', 'username email profilePic');

    const total = await Post.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      posts,
      currentPage: page,
      totalPages,
      totalPosts: total
    });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /posts - create post (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { text, image } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const post = await Post.create({ userId: req.user.id, text: text.trim(), image: image || '' });
    res.status(201).json(post);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /posts/:id/like - toggle like/unlike (auth required)
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const uid = req.user.id;
    const isLiked = post.likes.some((x) => x.toString() === uid);
    if (isLiked) {
      post.likes.pull(req.user.id);
    } else {
      // Create notification for post owner if it's not their own like
      if (post.userId.toString() !== req.user.id) {
        await Notification.create({
          userId: post.userId,
          type: 'like',
          fromUser: req.user.id,
          postId: post._id
        });
      }
      post.likes.push(req.user.id);
    }
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('userId', 'username email profilePic')
      .populate('comments.userId', 'username email profilePic');
    res.json(populated);
  } catch (err) {
    console.error('Toggle like error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /posts/:id/comment - add a comment (auth required)
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ userId: req.user.id, text: text.trim() });
    
    // Create notification for post owner if it's not their own comment
    if (post.userId.toString() !== req.user.id) {
      await Notification.create({
        userId: post.userId,
        type: 'comment',
        fromUser: req.user.id,
        postId: post._id,
        text: req.body.text.length > 50 ? req.body.text.substring(0, 47) + '...' : req.body.text
      });
    }
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('userId', 'username email profilePic')
      .populate('comments.userId', 'username email profilePic');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /posts/:postId/comments/:commentId/like - toggle like on a comment (auth required)
router.put('/:postId/comments/:commentId/like', auth, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const uid = req.user.id;
    const hasLiked = comment.likes?.some((x) => x.toString() === uid);
    if (hasLiked) {
      comment.likes = comment.likes.filter((x) => x.toString() !== uid);
    } else {
      comment.likes = [...(comment.likes || []), uid];
    }
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('userId', 'username email profilePic')
      .populate('comments.userId', 'username email profilePic');
    res.json(populated);
  } catch (err) {
    console.error('Toggle comment like error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /posts/:id - owner only
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    await post.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);

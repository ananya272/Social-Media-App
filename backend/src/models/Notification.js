const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // recipient
    type: { type: String, enum: ['like', 'comment', 'follow', 'system'], required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    text: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);

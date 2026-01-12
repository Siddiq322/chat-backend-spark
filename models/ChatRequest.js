/**
 * ChatRequest Model
 * Manages friend/chat requests between users
 * - Prevents duplicate requests
 * - Tracks request status: pending, accepted, rejected
 * - Used before users can start chatting
 */

const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      default: '',
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate requests
// Ensures a user can't send multiple requests to the same person
chatRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

// Index for faster queries
chatRequestSchema.index({ receiver: 1, status: 1 });
chatRequestSchema.index({ sender: 1, status: 1 });

module.exports = mongoose.model('ChatRequest', chatRequestSchema);

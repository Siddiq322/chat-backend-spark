/**
 * Message Model
 * Stores all chat messages with support for multiple types
 * - text: Regular text messages
 * - image: Image URLs from uploads
 * - gif: GIF URLs
 * - sticker: Sticker identifiers or URLs
 * 
 * Tracks message status: sent, delivered, read
 * Essential for real-time chat functionality
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true, // For faster message queries
    },
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
    type: {
      type: String,
      enum: ['text', 'image', 'gif', 'sticker'],
      default: 'text',
      required: true,
    },
    content: {
      type: String,
      required: true,
      // For text: the message text
      // For image/gif: the URL
      // For sticker: sticker ID or URL
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    // Additional metadata for different message types
    metadata: {
      fileName: String, // For image uploads
      fileSize: Number,
      mimeType: String,
      width: Number,
      height: Number,
    },
    // For message deletion/editing features (future)
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt = sent time
  }
);

// Index for efficient message queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, status: 1 });

module.exports = mongoose.model('Message', messageSchema);

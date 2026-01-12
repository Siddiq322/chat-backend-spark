/**
 * Conversation Model
 * Represents a 1-to-1 chat conversation between two users
 * - Stores participants
 * - Tracks last message for preview
 * - Manages unread counts for each participant
 */

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    // Unread count for each participant
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Ensure exactly 2 participants (1-to-1 chat)
conversationSchema.path('participants').validate(function (value) {
  return value.length === 2;
}, 'Conversation must have exactly 2 participants');

// Compound index to prevent duplicate conversations and faster lookups
conversationSchema.index({ participants: 1 });

// Method to get the other participant in conversation
conversationSchema.methods.getOtherParticipant = function (userId) {
  return this.participants.find(
    (participant) => participant.toString() !== userId.toString()
  );
};

module.exports = mongoose.model('Conversation', conversationSchema);

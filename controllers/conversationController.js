/**
 * Conversation Controller
 * Handles conversation-related operations
 */

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for current user
 * @access  Private
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'username email profilePicture isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        select: 'type content sender createdAt status',
      })
      .sort({ updatedAt: -1 }); // Most recent first

    // Format conversations for frontend
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );

      return {
        _id: conv._id,
        participant: otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount?.get(userId.toString()) || 0,
        updatedAt: conv.updatedAt,
      };
    });

    sendSuccess(res, 200, 'Conversations retrieved successfully', {
      conversations: formattedConversations,
      count: formattedConversations.length,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    sendError(res, 500, 'Error retrieving conversations');
  }
};

/**
 * @route   GET /api/conversations/:conversationId
 * @desc    Get conversation details
 * @access  Private
 */
const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId).populate(
      'participants',
      'username email profilePicture isOnline lastSeen'
    );

    if (!conversation) {
      return sendError(res, 404, 'Conversation not found');
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === userId.toString()
    );

    if (!isParticipant) {
      return sendError(res, 403, 'Not authorized to access this conversation');
    }

    sendSuccess(res, 200, 'Conversation retrieved successfully', {
      conversation,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    sendError(res, 500, 'Error retrieving conversation');
  }
};

/**
 * @route   DELETE /api/conversations/:conversationId
 * @desc    Delete conversation (and all messages)
 * @access  Private
 */
const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return sendError(res, 404, 'Conversation not found');
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return sendError(res, 403, 'Not authorized to delete this conversation');
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversationId });

    // Delete conversation
    await Conversation.findByIdAndDelete(conversationId);

    sendSuccess(res, 200, 'Conversation deleted successfully');
  } catch (error) {
    console.error('Delete conversation error:', error);
    sendError(res, 500, 'Error deleting conversation');
  }
};

module.exports = {
  getConversations,
  getConversation,
  deleteConversation,
};

/**
 * Message Controller
 * Handles message-related HTTP operations
 * Real-time messaging is handled by Socket.IO
 */

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { sendSuccess, sendError } = require('../utils/response');
const { uploadToCloudinary } = require('../utils/cloudinary');
const fs = require('fs').promises;

/**
 * @route   GET /api/messages/:conversationId
 * @desc    Get all messages in a conversation
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 50 } = req.query;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return sendError(res, 404, 'Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return sendError(res, 403, 'Not authorized to access these messages');
    }

    // Get messages with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'username profilePicture')
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await Message.countDocuments({ conversationId });

    // Mark messages as delivered if they were sent to current user
    await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        status: 'sent',
      },
      { status: 'delivered' }
    );

    sendSuccess(res, 200, 'Messages retrieved successfully', {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / parseInt(limit)),
        totalMessages,
        hasMore: skip + messages.length < totalMessages,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    sendError(res, 500, 'Error retrieving messages');
  }
};

/**
 * @route   POST /api/messages/upload
 * @desc    Upload image for message
 * @access  Private
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Please upload an image');
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'chat-spark/messages');

    // Delete local file after upload
    await fs.unlink(req.file.path);

    sendSuccess(res, 200, 'Image uploaded successfully', {
      url: result.url,
      width: result.width,
      height: result.height,
      size: result.size,
      format: result.format,
    });
  } catch (error) {
    console.error('Upload image error:', error);

    // Clean up local file if upload failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting local file:', unlinkError);
      }
    }

    sendError(res, 500, 'Error uploading image');
  }
};

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message
 * @access  Private
 */
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return sendError(res, 404, 'Message not found');
    }

    // Only sender can delete their message
    if (message.sender.toString() !== userId.toString()) {
      return sendError(res, 403, 'Not authorized to delete this message');
    }

    // Soft delete (mark as deleted)
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await message.save();

    sendSuccess(res, 200, 'Message deleted successfully', {
      message,
    });
  } catch (error) {
    console.error('Delete message error:', error);
    sendError(res, 500, 'Error deleting message');
  }
};

/**
 * @route   PUT /api/messages/:conversationId/read
 * @desc    Mark all messages in conversation as read
 * @access  Private
 */
const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return sendError(res, 404, 'Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return sendError(res, 403, 'Not authorized');
    }

    // Mark all unread messages as read
    const result = await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        status: { $in: ['sent', 'delivered'] },
      },
      { status: 'read' }
    );

    // Reset unread count
    conversation.unreadCount.set(userId.toString(), 0);
    await conversation.save();

    sendSuccess(res, 200, 'Messages marked as read', {
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    sendError(res, 500, 'Error marking messages as read');
  }
};

module.exports = {
  getMessages,
  uploadImage,
  deleteMessage,
  markMessagesAsRead,
};

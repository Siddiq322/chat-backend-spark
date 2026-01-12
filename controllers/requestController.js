/**
 * Chat Request Controller
 * Handles sending, accepting, and rejecting chat requests
 */

const ChatRequest = require('../models/ChatRequest');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @route   POST /api/requests/send
 * @desc    Send a chat request to another user
 * @access  Private
 */
const sendChatRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, message } = req.body;

    // Can't send request to yourself
    if (senderId.toString() === receiverId) {
      return sendError(res, 400, 'Cannot send request to yourself');
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return sendError(res, 404, 'User not found');
    }

    // Check if request already exists
    const existingRequest = await ChatRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return sendError(res, 400, 'Request already pending');
      }
      if (existingRequest.status === 'accepted') {
        return sendError(res, 400, 'Already connected with this user');
      }
      if (existingRequest.status === 'rejected') {
        // Allow resending after rejection
        existingRequest.status = 'pending';
        existingRequest.sender = senderId;
        existingRequest.receiver = receiverId;
        existingRequest.message = message || '';
        await existingRequest.save();

        const populatedRequest = await ChatRequest.findById(existingRequest._id)
          .populate('sender', 'username email profilePicture')
          .populate('receiver', 'username email profilePicture');

        return sendSuccess(res, 200, 'Request resent successfully', {
          request: populatedRequest,
        });
      }
    }

    // Create new request
    const chatRequest = await ChatRequest.create({
      sender: senderId,
      receiver: receiverId,
      message: message || '',
    });

    const populatedRequest = await ChatRequest.findById(chatRequest._id)
      .populate('sender', 'username email profilePicture')
      .populate('receiver', 'username email profilePicture');

    sendSuccess(res, 201, 'Chat request sent successfully', {
      request: populatedRequest,
    });
  } catch (error) {
    console.error('Send chat request error:', error);
    sendError(res, 500, 'Error sending chat request');
  }
};

/**
 * @route   GET /api/requests/received
 * @desc    Get all received chat requests
 * @access  Private
 */
const getReceivedRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ChatRequest.find({
      receiver: userId,
      status: 'pending',
    })
      .populate('sender', 'username email profilePicture isOnline lastSeen')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Received requests retrieved successfully', {
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error('Get received requests error:', error);
    sendError(res, 500, 'Error retrieving requests');
  }
};

/**
 * @route   GET /api/requests/sent
 * @desc    Get all sent chat requests
 * @access  Private
 */
const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ChatRequest.find({
      sender: userId,
      status: 'pending',
    })
      .populate('receiver', 'username email profilePicture isOnline lastSeen')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Sent requests retrieved successfully', {
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error('Get sent requests error:', error);
    sendError(res, 500, 'Error retrieving requests');
  }
};

/**
 * @route   PUT /api/requests/:requestId/accept
 * @desc    Accept a chat request
 * @access  Private
 */
const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const chatRequest = await ChatRequest.findById(requestId);

    if (!chatRequest) {
      return sendError(res, 404, 'Request not found');
    }

    // Only receiver can accept
    if (chatRequest.receiver.toString() !== userId.toString()) {
      return sendError(res, 403, 'Not authorized to accept this request');
    }

    if (chatRequest.status !== 'pending') {
      return sendError(res, 400, 'Request already processed');
    }

    // Update request status
    chatRequest.status = 'accepted';
    await chatRequest.save();

    // Create conversation between users
    const conversation = await Conversation.create({
      participants: [chatRequest.sender, chatRequest.receiver],
    });

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'username email profilePicture isOnline lastSeen');

    sendSuccess(res, 200, 'Request accepted successfully', {
      request: chatRequest,
      conversation: populatedConversation,
    });
  } catch (error) {
    console.error('Accept request error:', error);
    sendError(res, 500, 'Error accepting request');
  }
};

/**
 * @route   PUT /api/requests/:requestId/reject
 * @desc    Reject a chat request
 * @access  Private
 */
const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const chatRequest = await ChatRequest.findById(requestId);

    if (!chatRequest) {
      return sendError(res, 404, 'Request not found');
    }

    // Only receiver can reject
    if (chatRequest.receiver.toString() !== userId.toString()) {
      return sendError(res, 403, 'Not authorized to reject this request');
    }

    if (chatRequest.status !== 'pending') {
      return sendError(res, 400, 'Request already processed');
    }

    // Update request status
    chatRequest.status = 'rejected';
    await chatRequest.save();

    sendSuccess(res, 200, 'Request rejected successfully', {
      request: chatRequest,
    });
  } catch (error) {
    console.error('Reject request error:', error);
    sendError(res, 500, 'Error rejecting request');
  }
};

module.exports = {
  sendChatRequest,
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
};

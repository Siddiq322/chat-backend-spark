/**
 * Message Routes
 */

const express = require('express');
const router = express.Router();
const {
  getMessages,
  uploadImage,
  deleteMessage,
  markMessagesAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// All message routes are protected
router.use(protect);

// Get messages for a conversation
router.get('/:conversationId', getMessages);

// Upload image for message
router.post('/upload', upload.single('image'), uploadImage);

// Mark messages as read
router.put('/:conversationId/read', markMessagesAsRead);

// Delete message
router.delete('/:messageId', deleteMessage);

module.exports = router;

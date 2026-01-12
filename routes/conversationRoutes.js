/**
 * Conversation Routes
 */

const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversation,
  deleteConversation,
} = require('../controllers/conversationController');
const { protect } = require('../middlewares/auth');

// All conversation routes are protected
router.use(protect);

// Get all user conversations
router.get('/', getConversations);

// Get specific conversation
router.get('/:conversationId', getConversation);

// Delete conversation
router.delete('/:conversationId', deleteConversation);

module.exports = router;

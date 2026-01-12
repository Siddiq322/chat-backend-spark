/**
 * Chat Request Routes
 */

const express = require('express');
const router = express.Router();
const {
  sendChatRequest,
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
} = require('../controllers/requestController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { sendRequestValidation, requestActionValidation } = require('../utils/validators');

// All request routes are protected
router.use(protect);

// Send chat request
router.post('/send', sendRequestValidation, validate, sendChatRequest);

// Get received requests
router.get('/received', getReceivedRequests);

// Get sent requests
router.get('/sent', getSentRequests);

// Accept request
router.put('/:requestId/accept', requestActionValidation, validate, acceptRequest);

// Reject request
router.put('/:requestId/reject', requestActionValidation, validate, rejectRequest);

module.exports = router;

/**
 * Input Validation Utilities
 * Common validation rules for request data
 */

const { body, param, query } = require('express-validator');

// Authentication validations
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// User search validation
const searchValidation = [
  query('query')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query is required'),
];

// Chat request validations
const sendRequestValidation = [
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver ID is required')
    .isMongoId()
    .withMessage('Invalid receiver ID'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Message cannot exceed 200 characters'),
];

const requestActionValidation = [
  param('requestId')
    .notEmpty()
    .withMessage('Request ID is required')
    .isMongoId()
    .withMessage('Invalid request ID'),
];

// Message validations
const sendMessageValidation = [
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver ID is required')
    .isMongoId()
    .withMessage('Invalid receiver ID'),
  body('type')
    .isIn(['text', 'image', 'gif', 'sticker'])
    .withMessage('Invalid message type'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
];

// Profile update validation
const updateProfileValidation = [
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Bio cannot exceed 200 characters'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .toLowerCase(),
];

// Password change validation
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
];

module.exports = {
  registerValidation,
  loginValidation,
  searchValidation,
  sendRequestValidation,
  requestActionValidation,
  sendMessageValidation,
  updateProfileValidation,
  changePasswordValidation,
};

/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const {
  searchUsers,
  getUserProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword,
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { searchValidation, updateProfileValidation, changePasswordValidation } = require('../utils/validators');
const upload = require('../middlewares/upload');

// All user routes are protected
router.use(protect);

// Search users
router.get('/search', searchValidation, validate, searchUsers);

// Get user profile by ID
router.get('/:userId', getUserProfile);

// Update current user profile
router.put('/profile', updateProfileValidation, validate, updateProfile);

// Upload profile picture
router.post('/profile/picture', upload.single('image'), uploadProfilePicture);

// Change password
router.put('/password', changePasswordValidation, validate, changePassword);

module.exports = router;

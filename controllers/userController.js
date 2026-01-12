/**
 * User Controller
 * Handles user-related operations like search and profile updates
 */

const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { uploadToCloudinary } = require('../utils/cloudinary');
const fs = require('fs').promises;

/**
 * @route   GET /api/users/search
 * @desc    Search users by username
 * @access  Private
 */
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.trim().length === 0) {
      return sendError(res, 400, 'Search query is required');
    }

    // Search for users (case-insensitive, partial match)
    // Exclude current user from results
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: currentUserId },
    })
      .select('username email profilePicture bio isOnline lastSeen')
      .limit(20); // Limit results to prevent overload

    sendSuccess(res, 200, 'Users retrieved successfully', {
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Search users error:', error);
    sendError(res, 500, 'Error searching users');
  }
};

/**
 * @route   GET /api/users/:userId
 * @desc    Get user profile by ID
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      'username email profilePicture bio isOnline lastSeen createdAt'
    );

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, 200, 'User profile retrieved', { user });
  } catch (error) {
    console.error('Get user profile error:', error);
    sendError(res, 500, 'Error retrieving user profile');
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, bio } = req.body;

    const updateData = {};

    if (username) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({
        username,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return sendError(res, 400, 'Username already taken');
      }

      updateData.username = username;
    }

    if (bio !== undefined) {
      updateData.bio = bio;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, 200, 'Profile updated successfully', {
      user: updatedUser.getPublicProfile(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    sendError(res, 500, 'Error updating profile');
  }
};

/**
 * @route   POST /api/users/profile/picture
 * @desc    Upload profile picture
 * @access  Private
 */
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Please upload an image');
    }

    const userId = req.user._id;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'chat-spark/profiles');

    // Delete local file after upload
    await fs.unlink(req.file.path);

    // Update user profile picture
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: result.url },
      { new: true }
    );

    sendSuccess(res, 200, 'Profile picture uploaded successfully', {
      user: updatedUser.getPublicProfile(),
      imageUrl: result.url,
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    
    // Clean up local file if upload failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting local file:', unlinkError);
      }
    }

    sendError(res, 500, 'Error uploading profile picture');
  }
};

/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password field
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return sendError(res, 401, 'Current password is incorrect');
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    sendSuccess(res, 200, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    sendError(res, 500, 'Error changing password');
  }
};

module.exports = {
  searchUsers,
  getUserProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword,
};

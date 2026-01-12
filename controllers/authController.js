/**
 * Authentication Controller
 * Handles user registration and login
 */

const User = require('../models/User');
const { generateToken } = require('../utils/token');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('📝 Registration attempt:', { username, email });

    // Validate required fields
    if (!username || !email || !password) {
      return sendError(res, 400, 'Please provide username, email, and password');
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        console.log('❌ Email already exists:', email);
        return sendError(res, 400, 'Email already registered');
      }
      if (existingUser.username === username) {
        console.log('❌ Username already taken:', username);
        return sendError(res, 400, 'Username already taken');
      }
    }

    // Create new user (password will be hashed by pre-save middleware)
    const user = await User.create({
      username,
      email,
      password,
    });

    console.log('✅ User created successfully:', user._id);

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response with user data and token
    sendSuccess(res, 201, 'User registered successfully', {
      user: user.getPublicProfile(),
      token,
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return sendError(res, 400, messages.join(', '));
    }
    
    sendError(res, 500, 'Error registering user');
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email OR username and include password field
    const user = await User.findOne({
      $or: [
        { email: email },
        { username: email }  // Allow login with username in email field
      ]
    }).select('+password');

    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response
    sendSuccess(res, 200, 'Login successful', {
      user: user.getPublicProfile(),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 500, 'Error logging in');
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    sendSuccess(res, 200, 'User profile retrieved', {
      user: req.user.getPublicProfile(),
    });
  } catch (error) {
    console.error('GetMe error:', error);
    sendError(res, 500, 'Error retrieving user profile');
  }
};

module.exports = {
  register,
  login,
  getMe,
};

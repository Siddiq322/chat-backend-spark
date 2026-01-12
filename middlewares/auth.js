/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 * Attaches user object to request for use in controllers
 */

const User = require('../models/User');
const { verifyToken } = require('../utils/token');
const { sendError } = require('../utils/response');

/**
 * Protect routes - require valid JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return sendError(res, 401, 'Not authorized, no token provided');
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Get user from token (exclude password)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return sendError(res, 401, 'User not found');
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return sendError(res, 401, 'Not authorized, token invalid or expired');
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return sendError(res, 500, 'Server error in authentication');
  }
};

module.exports = { protect };

/**
 * Validation Middleware
 * Checks for validation errors from express-validator
 */

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return sendError(res, 400, 'Validation failed', errorMessages);
  }

  next();
};

module.exports = { validate };

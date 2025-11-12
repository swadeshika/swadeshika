const { validationResult } = require('express-validator');
const { getMessage } = require('../constants/messages');

/**
 * Middleware to handle validation errors from express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }
  
  // Format errors for consistent API response
  const formattedErrors = errors.array().map(error => ({
    field: error.param,
    message: error.msg,
    value: error.value,
  }));
  
  return res.status(400).json({
    success: false,
    message: getMessage('VALIDATION_ERROR'),
    errors: formattedErrors,
  });
};

/**
 * Middleware factory to validate request body against a schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateSchema = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  
  if (error) {
    const formattedErrors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type,
    }));
    
    return res.status(400).json({
      success: false,
      message: getMessage('VALIDATION_ERROR'),
      errors: formattedErrors,
    });
  }
  
  // Replace request body with validated and sanitized data
  req.body = value;
  next();
};

module.exports = {
  validate,
  validateSchema,
};

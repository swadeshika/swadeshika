// src/middlewares/validationMiddleware.js

/**
 * validationMiddleware.js
 * ------------------------
 * This middleware handles the validation results from `express-validator`.
 * 
 * WHY DO WE NEED THIS?
 * ---------------------
 * - Controllers should stay clean & focused on logic.
 * - Validation should stay separate.
 * - express-validator returns errors in a large/unusable format.
 * - This middleware converts those errors into a clean, readable response.
 * 
 * HOW IT WORKS:
 * -------------
 * 1. You define validation rules in routes (e.g. body('email').isEmail())
 * 2. express-validator stores validation results inside `req`
 * 3. This middleware extracts those results
 * 4. If validation fails → return 400 with list of errors
 * 5. If validation passes → continue to next middleware/controller
 */

const { validationResult } = require('express-validator'); 
// Extracts validation errors from request

const { getMessage } = require('../constants/messages'); 
// Unified message system for all validation messages

/**
 * validate()
 * ----------
 * This middleware checks if any validation errors exist
 * from the rules applied earlier in route definitions.
 *
 * If errors exist:
 *   → return 400 with formatted errors (field, message, value)
 *
 * If no errors:
 *   → call next() (continue request flow)
 */
const validate = (req, res, next) => {
  
  // Collect all validation errors from express-validator
  const errors = validationResult(req);

  // If no errors → move to next middleware/controller
  if (errors.isEmpty()) return next();

  // Format error output into a simple array instead of complex objects
  const formatted = errors.array().map(e => ({
    field: e.param,   // Which field failed (email, password, etc.)
    message: e.msg,   // The validation message
    value: e.value    // The invalid value user sent
  }));

  // Respond with 400 Bad Request
  return res.status(400).json({
    success: false,
    message: getMessage('VALIDATION_ERROR'),
    errors: formatted
  });
};

module.exports = { validate };

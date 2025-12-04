// src/routes/authRoutes.js

/**
 * Authentication Routes
 * ----------------------
 * This file defines all routes related to:
 * - User registration
 * - Login
 * - Refresh token
 * - Forgot/reset password
 * - Getting logged-in user info
 * - Logout
 *
 * WHY A SEPARATE ROUTE FILE?
 * ---------------------------
 * Keeps authentication logic isolated from the rest of the project.
 * Improves scaling, readability, and maintainability.
 */

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { getMessage } = require('../constants/messages');

const router = express.Router();

/* -------------------------------------------------------------------
   🔹 VALIDATION SCHEMAS
   Express-validator is used to validate inputs BEFORE they reach Controller
   This prevents junk/bad data from entering the database.
------------------------------------------------------------------- */

/**
 * Register Validation
 * -------------------
 * Ensures:
 * - Name exists & length 2–50 chars
 * - Valid email format
 * - Password is secure (strong-regex)
 * - Phone is optional but must be valid if provided
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage(getMessage('VALIDATION_NAME_REQUIRED'))
    .isLength({ min: 2, max: 50 })
    .withMessage(getMessage('VALIDATION_NAME_LENGTH', { min: 2, max: 50 })),

  body('email')
    .trim()
    .notEmpty().withMessage(getMessage('VALIDATION_EMAIL_REQUIRED'))
    .isEmail().withMessage(getMessage('VALIDATION_EMAIL_INVALID'))
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage(getMessage('VALIDATION_PASSWORD_REQUIRED'))
    .isLength({ min: 8 })
    .withMessage(getMessage('VALIDATION_PASSWORD_LENGTH', { min: 8 }))
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    .withMessage(getMessage('VALIDATION_PASSWORD_COMPLEXITY')),

  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone()
    .withMessage(getMessage('VALIDATION_PHONE_INVALID')),
];

/**
 * Login Validation
 * ----------------
 * Ensures:
 * - Email exists & valid format
 * - Password is provided
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage(getMessage('VALIDATION_EMAIL_REQUIRED'))
    .isEmail().withMessage(getMessage('VALIDATION_EMAIL_INVALID')),

  body('password')
    .notEmpty().withMessage(getMessage('VALIDATION_PASSWORD_REQUIRED')),
];

/**
 * Forgot Password Validation
 * --------------------------
 * Only email required since user requests reset link
 */
const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage(getMessage('VALIDATION_EMAIL_REQUIRED'))
    .isEmail().withMessage(getMessage('VALIDATION_EMAIL_INVALID')),
];

/**
 * Reset Password Validation
 * -------------------------
 * Ensures:
 * - New password is strong
 * - confirmPassword === password
 */
const resetPasswordValidation = [
  body('password')
    .notEmpty().withMessage(getMessage('VALIDATION_PASSWORD_REQUIRED'))
    .isLength({ min: 8 })
    .withMessage(getMessage('VALIDATION_PASSWORD_LENGTH', { min: 8 }))
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    .withMessage(getMessage('VALIDATION_PASSWORD_COMPLEXITY')),

  body('confirmPassword')
    .notEmpty().withMessage('Confirm password required')
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error('Passwords do not match');
      return true;
    })
];

/* -------------------------------------------------------------------
   🔹 PUBLIC ROUTES (NO TOKEN REQUIRED)
   These routes can be accessed by anyone (logged-in or not)
------------------------------------------------------------------- */

router.post('/register', registerValidation, validate, authController.register);

router.post('/login', loginValidation, validate, authController.login);

router.post('/refresh-token', authController.refreshToken);

router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);

router.post('/reset-password/:token', resetPasswordValidation, validate, authController.resetPassword);

/* -------------------------------------------------------------------
   🔹 PROTECTED ROUTES (TOKEN REQUIRED)
   authentication middleware runs BEFORE these routes
------------------------------------------------------------------- */

// Apply authenticate() middleware to all routes below
router.use(authenticate);

/**
 * /me
 * Returns logged-in user details (retrieved from decoded token)
 */
router.get('/me', authController.getMe);

/**
 * /logout
 * Clears refresh token cookie
 */
router.post('/logout', authController.logout);

/**
 * /change-password
 * Requires old_password and new_password
 */
router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword')
      .notEmpty().withMessage('New password required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
      .withMessage('Password must contain uppercase, lowercase, number and special char'),
  ],
  validate,
  authController.changePassword
);

module.exports = router;

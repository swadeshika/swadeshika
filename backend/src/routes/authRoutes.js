const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { getMessage } = require('../constants/messages');

const router = express.Router();

// Input validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage(getMessage('VALIDATION_NAME_REQUIRED'))
    .isLength({ min: 2, max: 50 })
    .withMessage(getMessage('VALIDATION_NAME_LENGTH', { min: 2, max: 50 })),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage(getMessage('VALIDATION_EMAIL_REQUIRED'))
    .isEmail()
    .withMessage(getMessage('VALIDATION_EMAIL_INVALID'))
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage(getMessage('VALIDATION_PASSWORD_REQUIRED'))
    .isLength({ min: 8 })
    .withMessage(getMessage('VALIDATION_PASSWORD_LENGTH', { min: 8 }))
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(getMessage('VALIDATION_PASSWORD_COMPLEXITY')),
  
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone()
    .withMessage(getMessage('VALIDATION_PHONE_INVALID')),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage(getMessage('VALIDATION_EMAIL_REQUIRED'))
    .isEmail()
    .withMessage(getMessage('VALIDATION_EMAIL_INVALID')),
  
  body('password')
    .notEmpty()
    .withMessage(getMessage('VALIDATION_PASSWORD_REQUIRED')),
];

const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage(getMessage('VALIDATION_EMAIL_REQUIRED'))
    .isEmail()
    .withMessage(getMessage('VALIDATION_EMAIL_INVALID')),
];

const resetPasswordValidation = [
  body('password')
    .notEmpty()
    .withMessage(getMessage('VALIDATION_PASSWORD_REQUIRED'))
    .isLength({ min: 8 })
    .withMessage(getMessage('VALIDATION_PASSWORD_LENGTH', { min: 8 }))
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(getMessage('VALIDATION_PASSWORD_COMPLEXITY')),
  
  body('confirmPassword')
    .notEmpty()
    .withMessage(getMessage('VALIDATION_CONFIRM_PASSWORD_REQUIRED'))
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(getMessage('VALIDATION_PASSWORDS_DO_NOT_MATCH'));
      }
      return true;
    }),
];

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, validate, authController.resetPassword);

// Protected routes (require authentication)
router.use(authenticate);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;

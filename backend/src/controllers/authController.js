// src/controllers/authController.js

/**
 * authController.js
 * -----------------
 * Handles ALL authentication logic:
 *
 * 1. User Registration
 * 2. Login
 * 3. Logout
 * 4. Get Logged-in User (me)
 * 5. Refresh Access Token using Refresh Token
 * 6. Forgot Password (generate password reset token)
 * 7. Reset Password (set new password)
 *
 * This controller is the heart of the authentication system.
 */

const { validationResult } = require('express-validator');
const UserModel = require('../models/userModel');

const {
  generateAuthTokens,
  verifyToken,
  generateToken,
} = require('../utils/jwt');

const { getMessage } = require('../constants/messages');
const { TOKEN_TYPES } = require('../constants/tokens');
const { comparePasswords, hashPassword } = require('../utils/hash');
const sendEmail = require('../utils/email');
const crypto = require('crypto');


/**
 * Refresh Token Cookie Configuration
 *
 * WHY?
 * ----
 * - httpOnly → JS cannot read cookie → SECURE
 * - sameSite strict → prevents CSRF attacks
 * - secure only in production → HTTPS only
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};



// ===================================================================
// 1. REGISTER USER
// ===================================================================

/**
 * register()
 * ----------
 * Creates a new user.
 * Steps:
 * 1. Validate input
 * 2. Create user in DB (password auto-hashed in model)
 * 3. Generate Access + Refresh tokens
 * 4. Store refresh token in cookie
 */
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Create new user
    const user = await UserModel.create({
      name,
      email,
      password,
      phone,
    });

    // Generate tokens for user
    const tokens = generateAuthTokens(user);

    // Save refresh token in cookie
    res.cookie('refreshToken', tokens.refresh.token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: getMessage('REGISTRATION_SUCCESS'),
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken: tokens.access.token,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: getMessage('INTERNAL_SERVER_ERROR'),
    });
  }
};



// ===================================================================
// 2. LOGIN USER
// ===================================================================

/**
 * login()
 * -------
 * Steps:
 * 1. Validate input
 * 2. Check if user exists
 * 3. Verify password using bcrypt
 * 4. Generate new tokens
 * 5. Set refresh token cookie
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userRow = await UserModel.findByEmail(email);
    if (!userRow)
      return res.status(401).json({
        success: false,
        message: getMessage('INVALID_CREDENTIALS'),
      });

    // Validate password
    const isValid = await comparePasswords(password, userRow.password);
    if (!isValid)
      return res.status(401).json({
        success: false,
        message: getMessage('INVALID_CREDENTIALS'),
      });

    // Remove password before sending user info
    const { password: _, ...user } = userRow;

    // Generate token pair
    const tokens = generateAuthTokens(user);

    // Save refresh token to cookie
    res.cookie('refreshToken', tokens.refresh.token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: getMessage('LOGIN_SUCCESS'),
      data: {
        user,
        accessToken: tokens.access.token,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: getMessage('INTERNAL_SERVER_ERROR'),
    });
  }
};



// ===================================================================
// 3. LOGOUT USER
// ===================================================================

/**
 * logout()
 * --------
 * Simply clears refresh token cookie.
 */
const logout = (req, res) => {
  try {
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: getMessage('LOGOUT_SUCCESS'),
    });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({
      success: false,
      message: getMessage('INTERNAL_SERVER_ERROR'),
    });
  }
};



// ===================================================================
// 4. GET LOGGED-IN USER (req.user comes from authenticate middleware)
// ===================================================================

/**
 * getMe()
 * -------
 * Returns currently logged-in user.
 * authenticate() middleware puts user in req.user
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({
      success: false,
      message: getMessage('INTERNAL_SERVER_ERROR'),
    });
  }
};



// ===================================================================
// 5. REFRESH ACCESS TOKEN
// ===================================================================

/**
 * refreshToken()
 * ---------------
 * Steps:
 * 1. Read refresh token from cookie/body
 * 2. Validate refresh token
 * 3. Load user using decoded.id
 * 4. Generate new Access + Refresh tokens
 * 5. Return new access token
 */
const refreshToken = async (req, res) => {
  try {
    const refresh = req.cookies.refreshToken || req.body.refreshToken;

    if (!refresh)
      return res.status(401).json({
        success: false,
        message: getMessage('TOKEN_REQUIRED'),
      });

    // Verify refresh token
    const decoded = verifyToken(refresh, TOKEN_TYPES.REFRESH);

    const user = await UserModel.findById(decoded.id);
    if (!user)
      return res.status(401).json({
        success: false,
        message: getMessage('USER_NOT_FOUND'),
      });

    // Generate fresh pair of tokens
    const tokens = generateAuthTokens(user);

    // Update refresh cookie
    res.cookie('refreshToken', tokens.refresh.token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      data: { accessToken: tokens.access.token },
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(401).json({
      success: false,
      message: getMessage('INVALID_REFRESH_TOKEN'),
    });
  }
};



// ===================================================================
// 6. FORGOT PASSWORD → Generate Reset Token
// ===================================================================

/**
 * forgotPassword()
 * ----------------
 * Generates Reset Password Token (RESET token)
 *
 * SECURITY:
 * ---------
 * - If user does NOT exist → still send success (do not reveal email existence)
 * - In production, this token would be emailed.
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findByEmail(email);

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a new password has been sent.',
      });
    }

    // 1. Generate a random password (8 characters)
    const newPassword = crypto.randomBytes(4).toString('hex');

    // 2. Hash and update password in DB
    await UserModel.forceSetPassword(user.id, newPassword);

    // 3. Send email
    const message = `Your password has been reset. Your new password is: ${newPassword}\n\nPlease login and change it immediately.`;

    await sendEmail({
      email: user.email,
      subject: 'Your New Password - Swadeshika',
      message,
    });

    return res.status(200).json({
      success: true,
      message: 'If the email exists, a new password has been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({
      success: false,
      message: getMessage('INTERNAL_SERVER_ERROR'),
    });
  }
};



// ===================================================================
// 7. RESET PASSWORD
// ===================================================================

/**
 * resetPassword()
 * ----------------
 * Steps:
 * 1. Decode RESET token
 * 2. Find user from token
 * 3. Save new password
 */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Verify RESET token
    const decoded = verifyToken(token, TOKEN_TYPES.RESET_PASSWORD);

    const user = await UserModel.findById(decoded.id);
    if (!user)
      return res.status(400).json({
        success: false,
        message: getMessage('INVALID_TOKEN'),
      });

    // Set new password
    await UserModel.forceSetPassword(user.id, password);

    return res.status(200).json({
      success: true,
      message: getMessage('PASSWORD_RESET_SUCCESS'),
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(400).json({
      success: false,
      message: getMessage('INVALID_TOKEN'),
    });
  }
};


module.exports = {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
};

// src/controllers/authController.js
const { validationResult } = require('express-validator');
const UserModel = require('../models/userModel');
const { generateAuthTokens, verifyToken, generateToken } = require('../utils/jwt');
const { getMessage } = require('../constants/messages');
const { TOKEN_TYPES } = require('../constants/tokens');
const { comparePasswords, hashPassword } = require('../utils/hash');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, phone } = req.body;
    const user = await UserModel.create({ name, email, password, phone });

    const tokens = generateAuthTokens(user);
    res.cookie('refreshToken', tokens.refresh.token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: getMessage('REGISTRATION_SUCCESS'),
      data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken: tokens.access.token }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: getMessage('INTERNAL_SERVER_ERROR') });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const userRow = await UserModel.findByEmail(email);
    if (!userRow) return res.status(401).json({ success: false, message: getMessage('INVALID_CREDENTIALS') });

    const isValid = await comparePasswords(password, userRow.password);
    if (!isValid) return res.status(401).json({ success: false, message: getMessage('INVALID_CREDENTIALS') });

    // Return user without password
    const { password: _, ...user } = userRow;
    const tokens = generateAuthTokens(user);

    res.cookie('refreshToken', tokens.refresh.token, COOKIE_OPTIONS);
    return res.status(200).json({
      success: true,
      message: getMessage('LOGIN_SUCCESS'),
      data: { user, accessToken: tokens.access.token }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: getMessage('INTERNAL_SERVER_ERROR') });
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    return res.status(200).json({ success: true, message: getMessage('LOGOUT_SUCCESS') });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ success: false, message: getMessage('INTERNAL_SERVER_ERROR') });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ success: false, message: getMessage('INTERNAL_SERVER_ERROR') });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refresh = req.cookies.refreshToken || req.body.refreshToken;
    if (!refresh) return res.status(401).json({ success: false, message: getMessage('TOKEN_REQUIRED') });

    const decoded = verifyToken(refresh, TOKEN_TYPES.REFRESH);
    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: getMessage('USER_NOT_FOUND') });

    // Optionally check blacklist here (redis)
    const tokens = generateAuthTokens(user);
    // Update cookie
    res.cookie('refreshToken', tokens.refresh.token, COOKIE_OPTIONS);

    return res.status(200).json({ success: true, data: { accessToken: tokens.access.token } });
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(401).json({ success: false, message: getMessage('INVALID_REFRESH_TOKEN') });
  }
};

// Forgot password: create a reset token (RESET token) and return it in dev
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Don't reveal
      return res.status(200).json({ success: true, message: getMessage('PASSWORD_RESET_LINK_SENT') });
    }
    const resetToken = generateToken({ id: user.id }, TOKEN_TYPES.RESET_PASSWORD);
    // You should email this link in production
    return res.status(200).json({ success: true, message: getMessage('PASSWORD_RESET_LINK_SENT'), ...(process.env.NODE_ENV !== 'production' && { resetToken }) });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: getMessage('INTERNAL_SERVER_ERROR') });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const decoded = verifyToken(token, TOKEN_TYPES.RESET_PASSWORD);
    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(400).json({ success: false, message: getMessage('INVALID_TOKEN') });

    // Set new password directly
    await UserModel.forceSetPassword(user.id, password);
    return res.status(200).json({ success: true, message: getMessage('PASSWORD_RESET_SUCCESS') });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(400).json({ success: false, message: getMessage('INVALID_TOKEN') });
  }
};

module.exports = { register, login, logout, getMe, refreshToken, forgotPassword, resetPassword };

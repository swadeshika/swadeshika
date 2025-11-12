const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const UserModel = require('../models/userModel');
const { generateAuthTokens, verifyToken } = require('../utils/jwt');
const { ROLES } = require('../constants/roles');
const { getMessage } = require('../constants/messages');
const { TOKEN_TYPES } = require('../constants/tokens');
const { hashPassword } = require('../utils/hash');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: getMessage('EMAIL_ALREADY_EXISTS'),
      });
    }

    // Create new user
    const user = await UserModel.create({
      name,
      email,
      password,
      phone,
      role: ROLES.CUSTOMER, // Default role is customer
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateAuthTokens(user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user data and access token
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
        accessToken,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: getMessage('INTERNAL_SERVER_ERROR'),
    });
  }
};

/**
 * @desc    Authenticate user and get tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: getMessage('INVALID_CREDENTIALS'),
      });
    }

    // Check if password is correct
    const isPasswordValid = await UserModel.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: getMessage('INVALID_CREDENTIALS'),
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateAuthTokens(user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user data and access token
    return res.status(200).json({
      success: true,
      message: getMessage('LOGIN_SUCCESS'),
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: getMessage('INTERNAL_SERVER_ERROR'),
    });
  }
};

/**
 * @desc    Logout user / clear refresh token cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: getMessage('LOGOUT_SUCCESS'),
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: getMessage('INTERNAL_SERVER_ERROR'),
    });
  }
};

/**
 * @desc    Get current user's profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    // User is already attached to req by the auth middleware
    const user = req.user;

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: getMessage('INTERNAL_SERVER_ERROR'),
    });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: getMessage('TOKEN_REQUIRED'),
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, TOKEN_TYPES.REFRESH);
    
    // Find user by ID from token
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: getMessage('USER_NOT_FOUND'),
      });
    }

    // Check if refresh token is still valid (not blacklisted)
    // This would require a check against a token blacklist in a production app
    // const isBlacklisted = await redisClient.get(`blacklist_${refreshToken}`);
    // if (isBlacklisted) {
    //   return res.status(401).json({
    //     success: false,
    //     message: getMessage('INVALID_REFRESH_TOKEN'),
    //   });
    // }

    // Generate new access token
    const { accessToken: newAccessToken } = generateAuthTokens(user);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: getMessage('REFRESH_TOKEN_EXPIRED'),
      });
    }
    
    return res.status(401).json({
      success: false,
      message: getMessage('INVALID_REFRESH_TOKEN'),
    });
  }
};

/**
 * @desc    Forgot password - Send password reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // For security, don't reveal if the email exists or not
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      });
    }

    // Generate password reset token (expires in 1 hour)
    const resetToken = generateAuthTokens(user, 'reset_password');
    
    // In a real app, you would send an email with the reset link
    // await sendPasswordResetEmail(user.email, resetToken);

    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
      // In development, return the reset token for testing
      ...(process.env.NODE_ENV !== 'production' && { resetToken }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: getMessage('INTERNAL_SERVER_ERROR'),
    });
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Verify token
    const decoded = verifyToken(token, 'reset_password');
    
    // Find user by ID from token
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: getMessage('INVALID_TOKEN'),
      });
    }

    // Update password
    const hashedPassword = await hashPassword(password);
    await UserModel.updatePassword(user.id, hashedPassword);

    return res.status(200).json({
      success: true,
      message: getMessage('PASSWORD_RESET_SUCCESS'),
    });
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: getMessage('INVALID_TOKEN'),
      });
    }
    
    return res.status(500).json({
      success: false,
      message: getMessage('INTERNAL_SERVER_ERROR'),
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

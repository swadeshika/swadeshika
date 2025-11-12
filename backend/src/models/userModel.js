const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { hashPassword, comparePasswords } = require('../utils/hash');
const { generateToken, verifyToken } = require('../utils/jwt');
const { ROLES } = require('../constants/roles');
const { USER_MESSAGES } = require('../constants/messages');

/**
 * User Model
 * 
 * Handles all database operations related to users including:
 * - User registration and authentication
 * - Password hashing and verification
 * - JWT token generation and verification
 * - User data management
 */

class UserModel {
  /**
   * Create a new user
   * @param {Object} userData - User data including email, password, name, etc.
   * @returns {Promise<Object>} Created user data (without password)
   */
  static async create(userData) {
    const { email, password, name, phone, role = ROLES.CUSTOMER } = userData;
    
    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error(USER_MESSAGES.EMAIL_EXISTS);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Generate user ID
    const userId = uuidv4();
    
    // Insert user into database
    const [result] = await db.query(
      `INSERT INTO users (id, email, password, name, phone, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, email, hashedPassword, name, phone, role]
    );

    // Return user data without password
    return this.findById(userId);
  }

  /**
   * Find user by email
   * @param {string} email - User's email address
   * @returns {Promise<Object|null>} User data or null if not found
   */
  static async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT id, email, password, name, phone, role, created_at, updated_at FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User data or null if not found
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, email, name, phone, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Authenticate user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<{user: Object, token: string}>} User data and JWT token
   */
  static async authenticate(email, password) {
    // Find user by email
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error(USER_MESSAGES.INVALID_CREDENTIALS);
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      throw new Error(USER_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Remove password before returning
    const { password: _, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, token };
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user data
   */
  static async updateProfile(userId, updateData) {
    const { name, phone } = updateData;
    
    await db.query(
      'UPDATE users SET name = ?, phone = ?, updated_at = NOW() WHERE id = ?',
      [name, phone, userId]
    );
    
    return this.findById(userId);
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} True if successful
   */
  static async updatePassword(userId, currentPassword, newPassword) {
    // Get user with password
    const [users] = await db.query(
      'SELECT id, password FROM users WHERE id = ?',
      [userId]
    );
    
    if (!users.length) {
      throw new Error(USER_MESSAGES.USER_NOT_FOUND);
    }
    
    const user = users[0];
    
    // Verify current password
    const isPasswordValid = await comparePasswords(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error(USER_MESSAGES.INVALID_CURRENT_PASSWORD);
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    await db.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );
    
    return true;
  }
}

module.exports = UserModel;

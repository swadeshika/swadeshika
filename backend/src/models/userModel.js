// src/models/userModel.js

/**
 * User Model (MySQL)
 * -------------------
 * This class handles all database operations related to USERS.
 * 
 * Responsibilities:
 *  - Create User
 *  - Fetch User by email or ID
 *  - Verify credentials (login)
 *  - Update profile (name, phone)
 *  - Update or reset password
 * 
 * WHY A SEPARATE MODEL?
 * ---------------------
 * To keep database logic centralized.
 * No DB queries should be written inside controllers.
 */

const db = require('../config/db'); // MySQL connection pool
const { v4: uuidv4 } = require('uuid'); // Generate unique user ID
const { hashPassword, comparePasswords } = require('../utils/hash'); // Password utilities
const { USER_MESSAGES } = require('../constants/messages'); // User-related messages
const { ROLES } = require('../constants/roles'); // Default roles

class UserModel {

  /**
   * Create a new user
   * ------------------
   * Steps:
   *  1. Check if email already exists
   *  2. Hash password
   *  3. Generate UUID
   *  4. Insert into database
   *  5. Return newly created user
   */
  static async create({ email, password, name, phone, role = ROLES.CUSTOMER }) {

    // Check if user already exists with same email
    const existing = await this.findByEmail(email);
    if (existing) throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS || 'Email exists');

    // Securely hash password
    const hashed = await hashPassword(password);

    // Generate unique ID (UUID v4)
    const id = uuidv4();

    // Insert into MySQL
    await db.query(
      `INSERT INTO users (id, email, password, name, phone, role, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, email, hashed, name, phone, role]
    );

    // Return the full user object (except password)
    return this.findById(id);
  }


  /**
   * Find a user by their email
   * ---------------------------
   * Used in:
   *  - Login
   *  - Registration check
   *  - Forgot password
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
   * ----------------
   * Used in:
   *  - Auth middleware
   *  - getMe endpoint
   *  - Token verification
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, email, name, phone, role, created_at, updated_at FROM users WHERE id = ?', 
      [id]
    );
    return rows[0] || null;
  }


  /**
   * Verify credentials (for login)
   * -------------------------------
   * Steps:
   *  - Get user by email
   *  - Compare hashed password
   *  - Strip password before returning
   */
  static async verifyCredentials(email, password) {

    const user = await this.findByEmail(email);
    if (!user) return null;

    // Compare plain password with hashed password
    const match = await comparePasswords(password, user.password);
    if (!match) return null;

    // Remove password before returning
    const { password: removed, ...userData } = user;
    return userData;
  }


  /**
   * Update user profile
   * --------------------
   * Used when user edits:
   *  - name
   *  - phone
   */
  static async updateProfile(userId, { name, phone }) {

    await db.query(
      'UPDATE users SET name = ?, phone = ?, updated_at = NOW() WHERE id = ?', 
      [name, phone, userId]
    );

    return this.findById(userId); // Return updated user
  }


  /**
   * Update password (requires current password)
   * --------------------------------------------
   * Steps:
   *  1. Fetch user password
   *  2. Compare with currentPassword
   *  3. Hash new password
   *  4. Update DB
   */
  static async updatePassword(userId, currentPassword, newPassword) {

    const [rows] = await db.query(
      'SELECT password FROM users WHERE id = ?', 
      [userId]
    );

    if (!rows.length)
      throw new Error(USER_MESSAGES.USER_NOT_FOUND || 'User not found');

    const user = rows[0];

    // Check if current password matches
    const ok = await comparePasswords(currentPassword, user.password);
    if (!ok)
      throw new Error(USER_MESSAGES.INVALID_CURRENT_PASSWORD || 'Invalid current password');

    // Hash new password
    const hashed = await hashPassword(newPassword);

    // Update DB
    await db.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', 
      [hashed, userId]
    );

    return true;
  }


  /**
   * Force reset password (admin / forgot-password reset)
   * -----------------------------------------------------
   * Does NOT require checking old password.
   * Only used for:
   *  - Reset password with token
   *  - Admin resetting user password
   */
  static async forceSetPassword(userId, newPassword) {

    const hashed = await hashPassword(newPassword);

    await db.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', 
      [hashed, userId]
    );

    return true;
  }
}

module.exports = UserModel;

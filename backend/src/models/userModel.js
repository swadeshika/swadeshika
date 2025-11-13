// src/models/userModel.js
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { hashPassword, comparePasswords } = require('../utils/hash');
const { USER_MESSAGES } = require('../constants/messages'); // some keys may be in file
const { ROLES } = require('../constants/roles');

class UserModel {
  static async create({ email, password, name, phone, role = ROLES.CUSTOMER }) {
    const existing = await this.findByEmail(email);
    if (existing) throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS || 'Email exists');

    const hashed = await hashPassword(password);
    const id = uuidv4();
    await db.query(
      `INSERT INTO users (id, email, password, name, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, email, hashed, name, phone, role]
    );
    return this.findById(id);
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT id, email, password, name, phone, role, created_at, updated_at FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT id, email, name, phone, role, created_at, updated_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  // Convenience method for authentication (optional)
  static async verifyCredentials(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const match = await comparePasswords(password, user.password);
    if (!match) return null;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async updateProfile(userId, { name, phone }) {
    await db.query('UPDATE users SET name = ?, phone = ?, updated_at = NOW() WHERE id = ?', [name, phone, userId]);
    return this.findById(userId);
  }

  static async updatePassword(userId, currentPassword, newPassword) {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (!rows.length) throw new Error(USER_MESSAGES.USER_NOT_FOUND || 'User not found');
    const user = rows[0];
    const ok = await comparePasswords(currentPassword, user.password);
    if (!ok) throw new Error(USER_MESSAGES.INVALID_CURRENT_PASSWORD || 'Invalid current password');
    const hashed = await hashPassword(newPassword);
    await db.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashed, userId]);
    return true;
  }

  static async forceSetPassword(userId, newPassword) {
    const hashed = await hashPassword(newPassword);
    await db.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashed, userId]);
    return true;
  }
}

module.exports = UserModel;

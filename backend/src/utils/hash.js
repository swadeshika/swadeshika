// src/utils/hash.js

/**
 * Password Hashing Utilities
 * ---------------------------
 * This file handles:
 *  - Hashing passwords using bcrypt
 *  - Comparing plain password with hashed password
 *
 * WHY IS THIS SEPARATE?
 * ---------------------
 * Keeping hashing logic separate:
 *  - Makes authentication controllers clean
 *  - Allows easy switching of hashing algorithm in the future
 *  - Improves security by centralizing logic
 */

const bcrypt = require('bcrypt'); // Industry standard password hashing library
const { SALT_ROUNDS } = require('../config/constants'); // Salt rounds from env/config

/* ============================================================================
   1. Hash Password
   ----------------------------------------------------------------------------
   password  → string (plain text user password)
   returns   → hashed password

   WHY?
   - We never store plain passwords in the database
   - Bcrypt automatically salts + hashes securely
   ============================================================================ */
const hashPassword = async (password) => {
  // Generate a salt using configured number of rounds (default 10)
  const salt = await bcrypt.genSalt(parseInt(SALT_ROUNDS, 10) || 10);

  // Hash password with the salt
  return bcrypt.hash(password, salt);
};

/* ============================================================================
   2. Compare Passwords
   ----------------------------------------------------------------------------
   password  → plain text entered by user during login
   hashed    → hashed password stored in database

   WHY?
   - We never decrypt passwords
   - Instead, bcrypt compares the plain vs hashed safely
   ============================================================================ */
const comparePasswords = async (password, hashed) => {
  if (!password || !hashed) return false; // Extra safety
  return bcrypt.compare(password, hashed); // Returns true / false
};

/* ============================================================================
   EXPORTS
   ----------------------------------------------------------------------------
   These functions are used in:
   - authController (register, login, reset password)
   - userModel (update password)
   ============================================================================ */
module.exports = { hashPassword, comparePasswords };

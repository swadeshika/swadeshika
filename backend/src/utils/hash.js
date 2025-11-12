const bcrypt = require('bcrypt');
const constants = require('../config/constants');
const SALT_ROUNDS = constants.SALT_ROUNDS;

/**
 * Hashes a plain text password using bcrypt
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} A promise that resolves to the hashed password
 * @throws {Error} If password hashing fails
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(parseInt(SALT_ROUNDS));
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compares a plain text password with a hashed password
 * @param {string} password - The plain text password to verify
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match
 * @throws {Error} If password comparison fails
 */
const comparePasswords = async (password, hashedPassword) => {
  try {
    if (!password || !hashedPassword) {
      return false;
    }
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Failed to compare passwords');
  }
};

module.exports = {
  hashPassword,
  comparePasswords,
};

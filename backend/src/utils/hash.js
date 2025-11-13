// src/utils/hash.js
const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../config/constants');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(parseInt(SALT_ROUNDS, 10) || 10);
  return bcrypt.hash(password, salt);
};

const comparePasswords = async (password, hashed) => {
  if (!password || !hashed) return false;
  return bcrypt.compare(password, hashed);
};

module.exports = { hashPassword, comparePasswords };

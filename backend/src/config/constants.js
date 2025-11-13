// src/config/constants.js
module.exports = {
  PAGINATION: { DEFAULT_LIMIT: 10, MAX_LIMIT: 100, DEFAULT_PAGE: 1 },
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || '10', 10),
  FILE_UPLOAD: { MAX_FILE_SIZE: 5 * 1024 * 1024, ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png'] }
};

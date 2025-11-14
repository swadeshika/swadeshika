// src/config/constants.js

// This file stores global constants used throughout the app.
// Purpose:
// - Central place for reusable static values
// - Keeps controllers/models clean
// - Easy to update settings without changing multiple files

module.exports = {

  // ---------------------------------------------------------
  // Pagination Settings (Used for product listing, orders, etc.)
  // ---------------------------------------------------------
  PAGINATION: {
    DEFAULT_LIMIT: 10,   // Default items per page if client doesn't send limit
    MAX_LIMIT: 100,      // Maximum allowed limit to protect DB overload
    DEFAULT_PAGE: 1      // Default page number
  },

  // ---------------------------------------------------------
  // Bcrypt Password Hashing Settings
  // ---------------------------------------------------------
  // SALT_ROUNDS controls password hashing complexity.
  // Higher = more secure but slower.
  // Default = 10 (industry standard).
  //
  // Fetching from .env makes it configurable.
  //
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || '10', 10),

  // ---------------------------------------------------------
  // File Upload Settings (Used later for product images, user profile image)
  // ---------------------------------------------------------
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // Max 5MB file size allowed
    ALLOWED_FILE_TYPES: [
      'image/jpeg',
      'image/png'
    ] // Only allow JPG/PNG images for safety
  }
};

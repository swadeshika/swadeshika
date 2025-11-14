// src/config/env.js

// Load variables from .env file into process.env
// Example: process.env.PORT, process.env.DB_HOST etc.
require('dotenv').config();


// -------------------------------------------------------------
// Create a centralized configuration object
// -------------------------------------------------------------
// All environment variables for your project are stored here.
//
// Why?
// - Easy to manage
// - Easy to validate
// - Prevents accessing raw process.env everywhere in the code
//
// Each key has a fallback default value for development mode.
//
const config = {
  // Server Environment
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database Environment
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'ecommerce_db',

  // JWT Settings
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_ISSUER: process.env.JWT_ISSUER || 'swadeshika-ecommerce',

  // CORS Allowed Origin
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 mins
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100, // max 100 reqs

  // File Upload Config
  UPLOAD_LIMIT: process.env.UPLOAD_LIMIT || '10mb',

  // Password Hashing
  SALT_ROUNDS: process.env.SALT_ROUNDS || 10,
};


// -------------------------------------------------------------
// Export a Proxy instead of `config` directly
// -------------------------------------------------------------
//
// Why use Proxy?
// - Prevents accessing undefined config keys
// - Prevents modifying config at runtime
//
// Example:
// config.UNKNOWN  → will throw an error
//
// This avoids silent bugs.
//
// config.PORT = 9000 → throws error ("cannot modify config")
//
module.exports = new Proxy(config, {
  // Validate "get": only return real keys
  get(target, prop) {
    if (prop in target) return target[prop];
    throw new Error(`Config property "${prop}" does not exist`);
  },

  // Prevent modifying config in runtime
  set() {
    throw new Error('Cannot modify config at runtime');
  }
});

// src/config/env.js
require('dotenv').config();

const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'ecommerce_db',
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_ISSUER: process.env.JWT_ISSUER || 'swadeshika-ecommerce',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100,
  UPLOAD_LIMIT: process.env.UPLOAD_LIMIT || '10mb',
  SALT_ROUNDS: process.env.SALT_ROUNDS || 10,
};

module.exports = new Proxy(config, {
  get(target, prop) {
    if (prop in target) return target[prop];
    throw new Error(`Config property "${prop}" does not exist`);
  },
  set() {
    throw new Error('Cannot modify config at runtime');
  }
});

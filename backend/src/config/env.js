require('dotenv').config();

const requiredEnvVars = [
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'NODE_ENV'
];

// Check for required environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

const config = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // API configuration
  API_PREFIX: '/api',
  
  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100, // Limit each IP to 100 requests per windowMs
  
  // Upload configuration
  UPLOAD_LIMIT: process.env.UPLOAD_LIMIT || '10mb',
  
  // Session configuration (if using sessions)
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret',
  SESSION_MAX_AGE: process.env.SESSION_MAX_AGE || 24 * 60 * 60 * 1000, // 1 day
};

// Export config with getter to prevent modification
module.exports = new Proxy(config, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    throw new Error(`Config property "${prop}" does not exist`);
  },
  set() {
    throw new Error('Cannot modify config at runtime');
  },
});

// src/server.js
require('dotenv').config();
const { connectDB } = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Connect database first
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Graceful handlers
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection:', err && err.message ? err.message : err);
      server.close(() => process.exit(1));
    });
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err && err.message ? err.message : err);
      server.close(() => process.exit(1));
    });

    module.exports = { app, server };
  } catch (err) {
    console.error('DB connection failed - exiting:', err);
    process.exit(1);
  }
})();

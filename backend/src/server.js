// src/server.js
// Load environment variables from the .env file into process.env
// Why? So DB credentials, JWT secret, PORT, etc. remain secure and not hard-coded.
require('dotenv').config();

// Import the function that connects to the MySQL database
// WHY? We must ensure the DB connection is established before starting the server.
const { connectDB } = require('./config/db');

// Import the Express application instance
// app.js contains all middlewares, routes, security handlers, etc.
const app = require('./app');

// Import Socket.IO initialization
const { initSocketServer } = require('./config/socketServer');

// Get the port number from environment variables
// Fallback to 5000 if PORT is not defined in .env
const PORT = process.env.PORT || 5000;

/**
 * Immediately Invoked Async Function Expression (IIFE)
 * WHY? Because top-level await is not allowed in CommonJS,
 * so we wrap async logic inside an async function and immediately call it.
 */
(async () => {
  try {
    // STEP 1: Connect to the database before starting the server
    // If DB connection fails → catch block will handle and exit process
    await connectDB();

    // STEP 2: Create HTTP server from Express app (required for Socket.IO)
    const http = require('http');
    const server = http.createServer(app);

    // STEP 3: Initialize Socket.IO with the HTTP server
    initSocketServer(server);
    console.log('🔌 Socket.IO initialized for real-time notifications');

    // STEP 4: Start the server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });

    // Increase server timeout to 5 minutes (300000 ms) for large uploads
    server.timeout = 300000;
    server.keepAliveTimeout = 300000;
    server.headersTimeout = 301000;

    // Handle server 'error' events (eg. port already in use)
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.\n` +
          `- Ensure no other process is listening on this port.\n` +
          `- Or set a different PORT in your .env file or environment.`);
        // Give a short delay to ensure logs flush, then exit
        setTimeout(() => process.exit(1), 100);
      } else {
        // If it's a different error, rethrow to be handled by uncaughtException
        throw err;
      }
    });

    /**
     * GLOBAL ERROR HANDLING
     * -----------------------
     * Unhandled promise rejections happen when a Promise is rejected
     * but not caught anywhere. This can crash the server.
     * So we catch it here, log it, and safely shut down the server.
     */
    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Rejection:", err);
      // Gracefully close the server before exiting the process
      server.close(() => process.exit(1));
    });

    /**
     * Uncaught exceptions happen when some synchronous code throws an error
     * and no try/catch handles it.
     * Without this handler, Node.js process will crash instantly.
     */
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      // Gracefully shut down the server before exiting
      server.close(() => process.exit(1));
    });

  } catch (err) {
    /**
     * If database connection fails at startup:
     * - Log the error
     * - Exit the process because the server cannot run without DB
     */
    console.error("DB Connection Failed:", err);
    process.exit(1);
  }
})();


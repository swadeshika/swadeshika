// src/config/db.js

// Import MySQL2 (promise-based version)
const mysql = require('mysql2/promise');

// Import database environment variables
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require('./env');


// -------------------------------------------------------------
// Create MySQL Connection Pool
// -------------------------------------------------------------
//
// Why pool instead of single connection?
// - Faster (connections are reused)
// - Prevents "too many connections" error
// - Handles concurrent requests
//
// connectionLimit → max connections at same time
// waitForConnections → queue requests when busy
//
const pool = mysql.createPool({
  host: DB_HOST,            // DB server host
  user: DB_USER,            // DB username
  password: DB_PASSWORD,    // DB password
  database: DB_NAME,        // Database name to connect to

  waitForConnections: true, // Queue queries if limit reached
  connectionLimit: 10,       // Max active connections
  queueLimit: 0,             // 0 = unlimited queue
});


// -------------------------------------------------------------
// Test DB Connection
// -------------------------------------------------------------
//
// connectDB() is called in server.js before starting the server.
//
// It checks:
// 1. Is MySQL running?
// 2. Are credentials correct?
// 3. Is database reachable?
//
// Why getConnection() & release?
// - To test pool without doing any actual query
//
async function connectDB() {
  try {
    const conn = await pool.getConnection(); // Get a connection
    conn.release();                           // Release back to pool

    console.log('✅ Database connected successfully');
    return pool;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    throw err; // Let server.js handle the error & stop server
  }
}


// -------------------------------------------------------------
// Export reusable DB functions
// -------------------------------------------------------------
//
// 1. pool → full connection pool (advanced use)
// 2. connectDB → called once at server startup
// 3. query → simple SQL helper (most used)
// 4. getConnection → manual transaction support
//
// Example:
// const [rows] = await query("SELECT * FROM users WHERE id = ?", [id]);
//
module.exports = {
  pool,

  // Test DB before server starts
  connectDB,

  // Run simple SQL queries
  query: (sql, params) => pool.execute(sql, params || []),

  // For transactions (BEGIN, COMMIT, ROLLBACK)
  getConnection: () => pool.getConnection(),
};

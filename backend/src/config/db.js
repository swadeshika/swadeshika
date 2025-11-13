// src/config/db.js
const mysql = require('mysql2/promise');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require('./env');

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function connectDB() {
  try {
    const conn = await pool.getConnection();
    conn.release();
    console.log('✅ Database connected successfully');
    return pool;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    throw err;
  }
}

module.exports = {
  pool,
  connectDB,
  query: (sql, params) => pool.execute(sql, params || []),
  getConnection: () => pool.getConnection(),
};

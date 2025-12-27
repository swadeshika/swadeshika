const db = require('../src/config/db');

const customersTableQuery = `
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  status ENUM('Active', 'Inactive', 'Blocked') DEFAULT 'Active',
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const reportsTableQuery = `
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_type ENUM('sales', 'inventory', 'customers', 'financial', 'custom') NOT NULL,
  name VARCHAR(255) NOT NULL,
  parameters JSON,
  data_snapshot JSON,
  file_url VARCHAR(500),
  format ENUM('json', 'pdf', 'csv', 'excel') DEFAULT 'json',
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  error_message TEXT,
  generated_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_type (report_type),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function run() {
    try {
        console.log('Ensuring admin-related tables exist...');
        
        console.log('1. Creating customers table (if not exists)...');
        await db.query(customersTableQuery);
        
        console.log('2. Creating reports table (if not exists)...');
        await db.query(reportsTableQuery);
        
        console.log('All tables verified/created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error ensuring tables:', err);
        process.exit(1);
    }
}

run();

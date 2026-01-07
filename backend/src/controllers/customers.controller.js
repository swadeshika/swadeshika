// src/controllers/customers.controller.js
const db = require('../config/db');

function splitName(fullName) {
     const safe = String(fullName || '').trim();
     if (!safe) return { first: '', last: '' };
     const parts = safe.split(/\s+/).filter(Boolean);
     return {
          first: parts[0] || '',
          last: parts.slice(1).join(' ') || ''
     };
}

exports.createCustomer = async (req, res) => {
     try {
          const { firstName, lastName, email, phone } = req.body;

          // Validate required fields
          if (!firstName || !lastName || !email) {
               return res.status(400).json({
                    success: false,
                    message: 'Please provide first name, last name, and email'
               });
          }

          const [result] = await db.query(
               'INSERT INTO customers (first_name, last_name, email, phone, join_date, status) VALUES (?, ?, ?, ?, NOW(), ?)',
               [firstName, lastName, email, phone, 'Active']
          );

          res.status(201).json({
               success: true,
               id: result.insertId,
               message: 'Customer created successfully'
          });
     } catch (err) {
          console.error('Error creating customer:', err);
          if (err.code === 'ER_DUP_ENTRY') {
               return res.status(409).json({ success: false, message: 'Email already exists' });
          }
          res.status(500).json({ success: false, message: 'Server error: ' + err.message });
     }
};

exports.getAllCustomers = async (req, res) => {
     try {
          const { page = 1, limit = 10, search, status, sortBy = 'join_date', sortOrder = 'DESC' } = req.query;
          const offset = (page - 1) * limit;

          // IMPORTANT:
          // The storefront uses `users` as the source of truth for customers (UUID id).
          // The `customers` table is CRM-style and may not be populated for every user.
          // Admin UI expects customer IDs to work with orders filtering (orders.user_id),
          // so we return `u.id` as `id` and merge CRM fields when present.

          const params = [];
          const conditions = ['u.role = "customer"'];

          if (search) {
               conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)');
               const searchParam = `%${search}%`;
               params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
          }

          if (status && status !== 'All' && status !== 'all') {
               conditions.push('COALESCE(c.status, "Active") = ?');
               params.push(status);
          }

          const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';

          // Whitelist sort fields to avoid SQL injection.
          const sortMap = {
               join_date: 'COALESCE(c.join_date, u.created_at)',
               email: 'u.email',
               name: 'u.name',
               status: 'COALESCE(c.status, "Active")'
          };
          const sortExpr = sortMap[sortBy] || sortMap.join_date;
          const sortDir = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

          const countQuery = `
               SELECT COUNT(*) as total
               FROM users u
               LEFT JOIN customers c ON u.email COLLATE utf8mb4_unicode_ci = c.email COLLATE utf8mb4_unicode_ci
               ${whereClause}
          `;

          const query = `
               SELECT
                    u.id as user_id,
                    u.name as user_name,
                    u.email,
                    u.phone as user_phone,
                    u.created_at,
                    c.first_name,
                    c.last_name,
                    c.phone as customer_phone,
                    c.status,
                    c.join_date,
                    COALESCE(os.total_orders, 0) as total_orders,
                    COALESCE(os.total_spent, 0) as total_spent
               FROM users u
               LEFT JOIN customers c ON u.email COLLATE utf8mb4_unicode_ci = c.email COLLATE utf8mb4_unicode_ci
               LEFT JOIN (
                    SELECT user_id, COUNT(*) as total_orders, COALESCE(SUM(total_amount), 0) as total_spent
                    FROM orders
                    GROUP BY user_id
               ) os ON os.user_id = u.id
               ${whereClause}
               ORDER BY ${sortExpr} ${sortDir}
               LIMIT ? OFFSET ?
          `;

          const [countResult] = await db.query(countQuery, params);
          const totalItems = countResult[0].total;

          const mainParams = [...params, parseInt(limit), parseInt(offset)];
          const [rows] = await db.query(query, mainParams);

          const normalized = rows.map(r => {
               const fromUserName = splitName(r.user_name);
               return {
                    id: r.user_id,
                    first_name: r.first_name || fromUserName.first,
                    last_name: r.last_name || fromUserName.last,
                    email: r.email,
                    phone: r.customer_phone || r.user_phone || null,
                    status: r.status || 'Active',
                    join_date: r.join_date || r.created_at,
                    orders: Number(r.total_orders || 0),
                    totalSpent: Number(r.total_spent || 0)
               };
          });

          res.status(200).json({
               success: true,
               data: normalized,
               pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalItems,
                    totalPages: Math.ceil(totalItems / limit)
               }
          });
     } catch (err) {
          console.error('Error fetching customers:', err);
          res.status(500).json({ success: false, message: 'Server error' });
     }
};

exports.getCustomerById = async (req, res) => {
     try {
          const userId = req.params.id;
          const [users] = await db.query(
               `SELECT id, name, email, phone, role, created_at
                FROM users
                WHERE id = ? AND role = 'customer'`,
               [userId]
          );

          if (users.length === 0) {
               return res.status(404).json({ success: false, message: 'Customer not found' });
          }

          const user = users[0];
          const [crmRows] = await db.query(
               `SELECT first_name, last_name, email, phone, status, join_date
                FROM customers
                WHERE email = ?`,
               [user.email]
          );
          const crm = crmRows[0] || null;

          const [orderStats] = await db.query(
               `SELECT COUNT(*) as orderCount, COALESCE(SUM(total_amount), 0) as totalSpent
                FROM orders
                WHERE user_id = ?`,
               [userId]
          );

          const fromUserName = splitName(user.name);
          const customer = {
               id: user.id,
               first_name: crm?.first_name || fromUserName.first,
               last_name: crm?.last_name || fromUserName.last,
               email: user.email,
               phone: crm?.phone || user.phone || null,
               status: crm?.status || 'Active',
               join_date: crm?.join_date || user.created_at,
               orders: orderStats[0].orderCount || 0,
               totalSpent: orderStats[0].totalSpent || 0
          };

          res.status(200).json({ success: true, data: customer });
     } catch (err) {
          console.error('Error fetching customer:', err);
          res.status(500).json({ success: false, message: 'Server error' });
     }
};

exports.updateCustomer = async (req, res) => {
     try {
          const { firstName, lastName, phone, status, first_name, last_name } = req.body;

          const userId = req.params.id;
          const [users] = await db.query(
               `SELECT id, name, email, phone, role, created_at
                FROM users
                WHERE id = ? AND role = 'customer'`,
               [userId]
          );

          if (users.length === 0) {
               return res.status(404).json({ success: false, message: 'Customer not found' });
          }
          const user = users[0];

          const resolvedFirst = first_name ?? firstName;
          const resolvedLast = last_name ?? lastName;

          // Basic validation
          if (!resolvedFirst && !resolvedLast && !phone && !status) {
               return res.status(400).json({ success: false, message: 'No fields to update' });
          }

          // Ensure a CRM row exists (keyed by email)
          await db.query(
               `INSERT INTO customers (first_name, last_name, email, phone, join_date, status)
                VALUES (?, ?, ?, ?, NOW(), ?)
                ON DUPLICATE KEY UPDATE email = email`,
               [
                    resolvedFirst || splitName(user.name).first || 'Customer',
                    resolvedLast || splitName(user.name).last || '',
                    user.email,
                    phone || user.phone || null,
                    status || 'Active'
               ]
          );

          const updates = [];
          const params = [];
          if (resolvedFirst != null) { updates.push('first_name = ?'); params.push(resolvedFirst); }
          if (resolvedLast != null) { updates.push('last_name = ?'); params.push(resolvedLast); }
          if (phone != null) { updates.push('phone = ?'); params.push(phone); }
          if (status != null) { updates.push('status = ?'); params.push(status); }

          if (updates.length > 0) {
               const query = `UPDATE customers SET ${updates.join(', ')}, updated_at = NOW() WHERE email = ?`;
               params.push(user.email);
               await db.query(query, params);
          }

          res.status(200).json({ success: true, message: 'Customer updated successfully' });
     } catch (err) {
          console.error('Error updating customer:', err);
          res.status(500).json({ success: false, message: 'Server error' });
     }
};

exports.deleteCustomer = async (req, res) => {
     try {
          const userId = req.params.id;
          const [users] = await db.query(
               `SELECT id, name, email, phone, role, created_at
                FROM users
                WHERE id = ? AND role = 'customer'`,
               [userId]
          );

          if (users.length === 0) {
               return res.status(404).json({ success: false, message: 'Customer not found' });
          }
          const user = users[0];

          // Ensure CRM row exists then mark inactive
          const nameParts = splitName(user.name);
          await db.query(
               `INSERT INTO customers (first_name, last_name, email, phone, join_date, status)
                VALUES (?, ?, ?, ?, NOW(), 'Inactive')
                ON DUPLICATE KEY UPDATE status = 'Inactive', updated_at = NOW()`,
               [nameParts.first || 'Customer', nameParts.last || '', user.email, user.phone || null]
          );

          res.status(200).json({ success: true, message: 'Customer deleted (marked inactive) successfully' });
     } catch (err) {
          console.error('Error deleting customer:', err);
          res.status(500).json({ success: false, message: 'Server error' });
     }
};

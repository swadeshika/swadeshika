// src/controllers/customers.controller.js
const db = require('../config/db');

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

          let query = 'SELECT * FROM customers';
          let countQuery = 'SELECT COUNT(*) as total FROM customers';
          const params = [];
          const conditions = [];

          if (search) {
               conditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
               const searchParam = `%${search}%`;
               params.push(searchParam, searchParam, searchParam);
          }

          if (status && status !== 'All' && status !== 'all') {
               conditions.push('status = ?');
               params.push(status);
          }

          if (conditions.length > 0) {
               const whereClause = ' WHERE ' + conditions.join(' AND ');
               query += whereClause;
               countQuery += whereClause;
          }

          // Add soft delete check if column exists, or rely on status
          // Assuming 'inactive' is the soft delete status

          query += ` ORDER BY ${sortBy} ${sortOrder === 'ASC' ? 'ASC' : 'DESC'} LIMIT ? OFFSET ?`;

          // Count total unique customers
          const [countResult] = await db.query(countQuery, params.slice(0, params.length)); // Copy params for count
          const totalItems = countResult[0].total;

          // Execute main query
          // limit and offset must be integers for some drivers, so parsing
          const mainParams = [...params, parseInt(limit), parseInt(offset)];
          const [rows] = await db.query(query, mainParams);

          // Normalize rows to match frontend shape: `orders` and `totalSpent`
          const normalized = rows.map(r => ({
               id: r.id,
               first_name: r.first_name,
               last_name: r.last_name,
               email: r.email,
               phone: r.phone,
               status: r.status,
               join_date: r.join_date,
               orders: r.total_orders || 0,
               totalSpent: r.total_spent || 0
          }));

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
          const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);

          if (rows.length === 0) {
               return res.status(404).json({ success: false, message: 'Customer not found' });
          }

          const customerRow = rows[0];

          // Calculate order stats by matching users.email to customers.email
          const [orderStats] = await db.query(
               `SELECT COUNT(*) as orderCount, COALESCE(SUM(o.total_amount), 0) as totalSpent
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE u.email = ?`,
               [customerRow.email]
          );

          const customer = {
               id: customerRow.id,
               first_name: customerRow.first_name,
               last_name: customerRow.last_name,
               email: customerRow.email,
               phone: customerRow.phone,
               status: customerRow.status,
               join_date: customerRow.join_date,
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
          const { firstName, lastName, phone, status } = req.body;

          // Basic validation
          if (!firstName && !lastName && !phone && !status) {
               return res.status(400).json({ success: false, message: 'No fields to update' });
          }

          let query = 'UPDATE customers SET ';
          const params = [];
          const updates = [];

          if (firstName) { updates.push('first_name = ?'); params.push(firstName); }
          if (lastName) { updates.push('last_name = ?'); params.push(lastName); }
          if (phone) { updates.push('phone = ?'); params.push(phone); }
          if (status) { updates.push('status = ?'); params.push(status); }

          query += updates.join(', ') + ' WHERE id = ?';
          params.push(req.params.id);

          const [result] = await db.query(query, params);

          if (result.affectedRows === 0) {
               return res.status(404).json({ success: false, message: 'Customer not found' });
          }

          res.status(200).json({ success: true, message: 'Customer updated successfully' });
     } catch (err) {
          console.error('Error updating customer:', err);
          res.status(500).json({ success: false, message: 'Server error' });
     }
};

exports.deleteCustomer = async (req, res) => {
     try {
          // Soft delete: set status to 'inactive'
          const [result] = await db.query('UPDATE customers SET status = ? WHERE id = ?', ['Inactive', req.params.id]);

          if (result.affectedRows === 0) {
               return res.status(404).json({ success: false, message: 'Customer not found' });
          }

          res.status(200).json({ success: true, message: 'Customer deleted (marked inactive) successfully' });
     } catch (err) {
          console.error('Error deleting customer:', err);
          res.status(500).json({ success: false, message: 'Server error' });
     }
};

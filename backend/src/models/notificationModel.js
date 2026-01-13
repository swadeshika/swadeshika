// Notification Model - Database operations for real-time notifications

const db = require('../config/db');

class NotificationModel {
  /**
   * Create a new notification
   */
  static async create({ type, title, description, data }) {
    const [result] = await db.query(
      `INSERT INTO notifications (type, title, description, data, \`read\`) 
       VALUES (?, ?, ?, ?, FALSE)`,
      [type, title, description || null, JSON.stringify(data || {})]
    );
    return result.insertId;
  }

  /**
   * Find all notifications with filters
   */
  static async findAll({ limit = 50, offset = 0, type, read } = {}) {
    let sql = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (read !== undefined) {
      sql += ' AND `read` = ?';
      params.push(read ? 1 : 0);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(sql, params);
    
    // Parse JSON data field
    return rows.map(row => ({
      ...row,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
      read: Boolean(row.read)
    }));
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(id) {
    await db.query('UPDATE notifications SET `read` = TRUE WHERE id = ?', [id]);
    return true;
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead() {
    await db.query('UPDATE notifications SET `read` = TRUE');
    return true;
  }

  /**
   * Delete a notification
   */
  static async delete(id) {
    await db.query('DELETE FROM notifications WHERE id = ?', [id]);
    return true;
  }

  /**
   * Delete all notifications
   */
  static async deleteAll() {
    await db.query('DELETE FROM notifications');
    return true;
  }

  /**
   * Count unread notifications
   */
  static async countUnread() {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM notifications WHERE `read` = FALSE');
    return rows[0].count;
  }
}

module.exports = NotificationModel;

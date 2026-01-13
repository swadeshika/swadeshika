// Notification Routes - API endpoints for managing notifications

const express = require('express');
const router = express.Router();
const NotificationModel = require('../models/notificationModel');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { checkAllProductsStock } = require('../services/stockAlertService');

/**
 * GET /api/v1/notifications
 * Get all notifications with optional filters
 */
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { limit, offset, type, read } = req.query;
    
    const notifications = await NotificationModel.findAll({
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      type,
      read: read === 'true' ? true : read === 'false' ? false : undefined
    });

    const unreadCount = await NotificationModel.countUnread();

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      count: notifications.length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a specific notification as read
 */
router.patch('/:id/read', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationModel.markAsRead(id);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

/**
 * PATCH /api/v1/notifications/mark-all-read
 * Mark all notifications as read
 */
router.patch('/mark-all-read', authenticate, authorize('admin'), async (req, res) => {
  try {
    await NotificationModel.markAllAsRead();

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

/**
 * DELETE /api/v1/notifications
 * Clear all notifications
 */
router.delete('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    await NotificationModel.deleteAll();

    res.status(200).json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications'
    });
  }
});

/**
 * DELETE /api/v1/notifications/:id
 * Delete a specific notification
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationModel.delete(id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

/**
 * POST /api/v1/notifications/check-stock
 * Manually trigger stock check for all products
 */
router.post('/check-stock', authenticate, authorize('admin'), async (req, res) => {
  try {
    const count = await checkAllProductsStock();

    res.status(200).json({
      success: true,
      message: `Stock check completed. ${count} low-stock alerts created.`,
      count
    });
  } catch (error) {
    console.error('Stock check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check stock'
    });
  }
});

module.exports = router;

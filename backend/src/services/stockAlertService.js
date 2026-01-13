// Stock Alert Service - Monitor and notify low stock

const { emitToAdmins } = require('../config/socketServer');
const NotificationModel = require('../models/notificationModel');

/**
 * Check if stock is low and send alert
 * Called after product stock is updated
 */
async function checkAndAlertLowStock(productId, stockQuantity, productName, threshold = 10) {
  try {
    // Only alert if stock is below or equal to threshold but still positive
    if (stockQuantity <= threshold && stockQuantity > 0) {
      const notification = {
        type: 'stock_alert',
        title: 'Low Stock Alert',
        description: `${productName} is running low (${stockQuantity} left)`,
        data: {
          productId,
          productName,
          stockQuantity,
          threshold,
          timestamp: new Date().toISOString()
        }
      };

      // Save to database
      const notificationId = await NotificationModel.create(notification);
      console.log(`📦 Stock alert created for ${productName}: ${stockQuantity} units`);

      // Emit to all connected admins via Socket.IO
      emitToAdmins('notification', {
        id: notificationId,
        ...notification,
        read: false,
        created_at: new Date()
      });

      return notificationId;
    } else if (stockQuantity === 0) {
      // Out of stock alert
      const notification = {
        type: 'stock_alert',
        title: 'Out of Stock',
        description: `${productName} is out of stock`,
        data: {
          productId,
          productName,
          stockQuantity: 0,
          threshold,
          timestamp: new Date().toISOString()
        }
      };

      const notificationId = await NotificationModel.create(notification);
      console.log(`⚠️  Out of stock alert for ${productName}`);

      emitToAdmins('notification', {
        id: notificationId,
        ...notification,
        read: false,
        created_at: new Date()
      });

      return notificationId;
    }

    return null;
  } catch (error) {
    console.error('Stock alert error:', error);
    throw error;
  }
}

/**
 * Batch check all products for low stock
 * Can be called manually or via cron job
 */
async function checkAllProductsStock() {
  try {
    const db = require('../config/db');
    
    // Get global threshold from settings or default to 10
    const [settings] = await db.query('SELECT low_stock_threshold FROM admin_settings LIMIT 1');
    const globalThreshold = settings[0]?.low_stock_threshold || 10;

    // Find products that are low on stock
    const [products] = await db.query(
      `SELECT id, name, stock_quantity, 
              COALESCE(low_stock_threshold, ?) as threshold
       FROM products 
       WHERE stock_quantity <= COALESCE(low_stock_threshold, ?) 
       AND stock_quantity > 0
       AND in_stock = 1`,
      [globalThreshold, globalThreshold]
    );

    console.log(`🔍 Checking stock for ${products.length} low-stock products`);

    for (const product of products) {
      await checkAndAlertLowStock(
        product.id,
        product.stock_quantity,
        product.name,
        product.threshold
      );
    }

    return products.length;
  } catch (error) {
    console.error('Batch stock check error:', error);
    throw error;
  }
}

module.exports = { 
  checkAndAlertLowStock,
  checkAllProductsStock
};

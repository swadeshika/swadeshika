const CartService = require('../services/cartService');

/**
 * cartController.js
 * -----------------
 * Handles shopping cart operations for authenticated users.
 * 
 * Operations:
 * 1. Get Cart
 * 2. Add Item to Cart
 * 3. Update Item Quantity
 * 4. Remove Item from Cart
 * 5. Clear Cart
 */
class CartController {
    /**
     * Get user's cart
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async getCart(req, res, next) {
        try {
            const userId = req.user.id;
            const cart = await CartService.getCart(userId);
            res.status(200).json({
                success: true,
                data: cart
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add item to cart
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async addToCart(req, res, next) {
        try {
            const userId = req.user.id;
            const { productId, variantId, quantity } = req.body;

            const result = await CartService.addToCart(userId, { productId, variantId, quantity });

            res.status(201).json({
                success: true,
                message: 'Item added to cart',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update cart item quantity
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async updateCartItem(req, res, next) {
        try {
            const userId = req.user.id;
            const { itemId } = req.params;
            const { quantity } = req.body;

            const result = await CartService.updateCartItem(userId, itemId, quantity);

            res.status(200).json({
                success: true,
                message: 'Cart updated',
                data: result
            });
        } catch (error) {
            if (error.message === 'Cart item not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * Remove item from cart
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async removeFromCart(req, res, next) {
        try {
            const userId = req.user.id;
            const { itemId } = req.params;

            await CartService.removeFromCart(userId, itemId);

            res.status(200).json({
                success: true,
                message: 'Item removed from cart'
            });
        } catch (error) {
            if (error.message === 'Cart item not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * Clear cart
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async clearCart(req, res, next) {
        try {
            const userId = req.user.id;
            await CartService.clearCart(userId);

            res.status(200).json({
                success: true,
                message: 'Cart cleared'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * CRITICAL FIX: Merge Cart (Batch Operation)
     * ===========================================
     * 
     * PURPOSE:
     * Merges local cart items (from guest session) into user's cart
     * after login. Uses a single database transaction to prevent
     * race conditions.
     * 
     * PROBLEM (Before):
     * - Frontend looped through items one by one
     * - Race condition between add and fetch
     * - No duplicate detection
     * - Partial failures left cart in inconsistent state
     * 
     * SOLUTION (Now):
     * - Single batch endpoint
     * - Database transaction for atomicity
     * - Duplicate detection and quantity merging
     * - Returns merged cart in single response
     * 
     * WHY THIS MATTERS:
     * - Prevents cart items from being lost
     * - Ensures data consistency
     * - Better performance (1 request vs N requests)
     * - Proper error handling
     * 
     * @param {Object} req - Express request object
     * @param {Object} req.body.items - Array of cart items to merge
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async mergeCart(req, res, next) {
        try {
            const userId = req.user.id;
            const { items } = req.body;

            // Validate items array
            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Items array is required and must not be empty'
                });
            }

            // Validate each item has required fields
            for (const item of items) {
                if (!item.productId || !item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each item must have productId and quantity'
                    });
                }
            }

            /**
             * TRANSACTION LOGIC:
             * ==================
             * 1. Begin transaction
             * 2. Get existing cart items
             * 3. For each new item:
             *    - Check if already in cart (same product + variant)
             *    - If exists: Add quantities
             *    - If new: Insert new row
             * 4. Commit transaction
             * 5. Return merged cart
             * 
             * If ANY step fails → Rollback entire operation
             */
            const mergedCart = await CartService.mergeCart(userId, items);

            res.status(200).json({
                success: true,
                message: `Successfully merged ${items.length} item(s) into cart`,
                data: mergedCart
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CartController;

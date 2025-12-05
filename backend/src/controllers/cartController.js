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
}

module.exports = CartController;

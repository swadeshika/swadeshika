const CartModel = require('../models/cartModel');

/**
 * cartService.js
 * --------------
 * Business logic for Shopping Cart operations.
 */
class CartService {
    /**
     * Get user's cart
     * 
     * @param {number|string} userId - User ID
     * @returns {Promise<Object>} Cart object with items and totals
     */
    static async getCart(userId) {
        const items = await CartModel.getCartItems(userId);
        
        // Calculate totals
        let subtotal = 0;
        let totalItems = 0;

        items.forEach(item => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            subtotal += price * quantity;
            totalItems += quantity;
        });

        return {
            items,
            summary: {
                subtotal,
                totalItems
            }
        };
    }

    /**
     * Add item to cart
     * 
     * @param {number|string} userId - User ID
     * @param {Object} itemData - { productId, variantId, quantity }
     * @returns {Promise<Object>} Updated cart item
     */
    static async addToCart(userId, itemData) {
        const { productId, variantId, quantity = 1 } = itemData;

        // Check if item already exists in cart
        const existingItem = await CartModel.findItem(userId, productId, variantId);

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            await CartModel.updateQuantity(existingItem.id, newQuantity);
            return { ...existingItem, quantity: newQuantity };
        } else {
            // Add new item
            const newItemId = await CartModel.addItem(userId, { productId, variantId, quantity });
            return { id: newItemId, productId, variantId, quantity };
        }
    }

    /**
     * Update cart item quantity
     * 
     * @param {number|string} userId - User ID
     * @param {number|string} itemId - Cart Item ID
     * @param {number} quantity - New quantity
     * @returns {Promise<boolean>} True if updated
     */
    static async updateCartItem(userId, itemId, quantity) {
        // Verify ownership
        const item = await CartModel.findById(itemId);
        if (!item || item.user_id !== userId) {
            throw new Error('Cart item not found');
        }

        return await CartModel.updateQuantity(itemId, quantity);
    }

    /**
     * Remove item from cart
     * 
     * @param {number|string} userId - User ID
     * @param {number|string} itemId - Cart Item ID
     * @returns {Promise<boolean>} True if removed
     */
    static async removeFromCart(userId, itemId) {
        // Verify ownership
        const item = await CartModel.findById(itemId);
        if (!item || item.user_id !== userId) {
            throw new Error('Cart item not found');
        }

        return await CartModel.removeItem(itemId);
    }

    /**
     * Clear cart
     * 
     * @param {number|string} userId - User ID
     * @returns {Promise<boolean>} True if cleared
     */
    static async clearCart(userId) {
        return await CartModel.clearCart(userId);
    }
}

module.exports = CartService;

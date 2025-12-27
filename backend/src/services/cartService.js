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

    /**
     * CRITICAL FIX: Merge Cart with Transaction Support
     * ==================================================
     * 
     * PURPOSE:
     * Merges multiple items into user's cart in a single atomic operation.
     * Uses database transaction to ensure all-or-nothing behavior.
     * 
     * TRANSACTION FLOW:
     * =================
     * 1. BEGIN TRANSACTION
     * 2. Get all existing cart items for user
     * 3. For each item to merge:
     *    a. Check if item already exists (same product + variant)
     *    b. If exists: UPDATE quantity (add to existing)
     *    c. If new: INSERT new cart item
     * 4. COMMIT TRANSACTION
     * 5. Return complete merged cart
     * 
     * ERROR HANDLING:
     * ===============
     * - If ANY operation fails → ROLLBACK entire transaction
     * - Cart remains in original state (no partial updates)
     * - Error is thrown to controller for proper response
     * 
     * WHY TRANSACTION IS CRITICAL:
     * ============================
     * - Prevents partial merges (some items added, some failed)
     * - Ensures data consistency
     * - Handles concurrent requests safely
     * - Allows atomic rollback on error
     * 
     * @param {number|string} userId - User ID
     * @param {Array} items - Array of items to merge [{productId, variantId, quantity}]
     * @returns {Promise<Object>} Complete merged cart with totals
     */
    static async mergeCart(userId, items) {
        const db = require('../config/db');
        const conn = await db.getConnection();
        
        try {
            // Step 1: Begin Transaction
            // This ensures all operations succeed or fail together
            await conn.beginTransaction();

            // Step 2: Get existing cart items
            // We need this to detect duplicates
            const [existingItems] = await conn.query(
                'SELECT * FROM cart_items WHERE user_id = ?',
                [userId]
            );

            // Create a map for quick lookup
            // Key: "productId-variantId" (variantId can be null)
            // Value: existing cart item
            const existingMap = new Map();
            existingItems.forEach(item => {
                const key = `${item.product_id}-${item.variant_id || 'null'}`;
                existingMap.set(key, item);
            });

            // Step 3: Process each item to merge
            for (const item of items) {
                const { productId, variantId, quantity } = item;
                const key = `${productId}-${variantId || 'null'}`;
                const existing = existingMap.get(key);

                if (existing) {
                    /**
                     * DUPLICATE FOUND: Update quantity
                     * =================================
                     * Add new quantity to existing quantity
                     * Example: Cart has 2, merging 3 → Result: 5
                     */
                    const newQuantity = existing.quantity + quantity;
                    await conn.query(
                        'UPDATE cart_items SET quantity = ? WHERE id = ?',
                        [newQuantity, existing.id]
                    );
                } else {
                    /**
                     * NEW ITEM: Insert into cart
                     * ===========================
                     * Add as new cart item
                     */
                    await conn.query(
                        'INSERT INTO cart_items (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
                        [userId, productId, variantId || null, quantity]
                    );
                }
            }

            // Step 4: Commit Transaction
            // All operations succeeded, make changes permanent
            await conn.commit();

            // Step 5: Return merged cart
            // Use existing getCart method to get complete cart with totals
            return await this.getCart(userId);

        } catch (error) {
            /**
             * ERROR HANDLING: Rollback Transaction
             * ====================================
             * 
             * If ANY operation failed:
             * - Rollback all changes
             * - Cart remains in original state
             * - Throw error to controller
             * 
             * COMMON ERRORS:
             * - Invalid product ID (foreign key constraint)
             * - Database connection lost
             * - Concurrent modification
             */
            await conn.rollback();
            console.error('[CartService] Merge cart transaction failed:', error);
            throw new Error(`Failed to merge cart: ${error.message}`);
        } finally {
            // Always release connection back to pool
            // This prevents connection leaks
            conn.release();
        }
    }
}

module.exports = CartService;

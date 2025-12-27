import { api } from '@/lib/api';

export interface CartItem {
    id: number; // cart_item_id
    user_id: string;
    product_id: number;
    variant_id: number | null;
    quantity: number;
    created_at: string;
    product_name: string;
    slug: string;
    price: number; // This is unit price
    compare_price: number | null;
    image_url: string;
    variant_name: string | null;
    variant_price: number | null;
}

export const cartService = {
    /**
     * Get user's cart
     */
    getCart: async () => {
        const res = await api.get<{ items: CartItem[]; summary: any }>('/cart');
        return res.data.data.items;
    },

    /**
     * Add item to cart
     */
    addToCart: async (data: { productId: number; variantId?: number | null; quantity: number; userId?: string | number | null }) => {
        const res = await api.post<{ message: string; data: number }>('/cart', data);
        return res.data;
    },

    /**
     * Update cart item quantity
     */
    updateCartItem: async (itemId: number, quantity: number) => {
        const res = await api.put<{ message: string; data: boolean }>(`/cart/${itemId}`, { quantity });
        return res.data;
    },

    /**
     * Remove item from cart
     */
    removeFromCart: async (itemId: number) => {
        const res = await api.delete<{ message: string }>(`/cart/${itemId}`);
        return res.data;
    },

    /**
     * Clear cart
     */
    clearCart: async () => {
        const res = await api.delete<{ message: string }>('/cart');
        return res.data;
    }
};

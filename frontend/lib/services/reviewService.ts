import { api } from '../api';

export interface Review {
    id?: number;
    product_id: number | string;
    order_id?: string;
    rating: number;
    title?: string;
    comment?: string;
    user_name?: string;
    is_verified?: boolean;
    created_at?: string;
}

export const reviewService = {
    /**
     * Create a new review
     */
    createReview: async (data: Review) => {
        const res = await api.post('/reviews', data);
        return res.data;
    },

    /**
     * Get reviews for a product
     */
    getProductReviews: async (productId: string | number) => {
        const res = await api.get<Review[]>(`/reviews/product/${productId}`);
        return res.data.data;
    },

    /**
     * Get current user's reviews
     */
    getMyReviews: async () => {
        const res = await api.get<Review[]>('/reviews/me');
        return res.data.data;
    },

    /**
     * Get pending reviews
     */
    getPendingReviews: async () => {
        const res = await api.get<{ data: any[] }>('/reviews/pending');
        return res.data.data;
    }
};

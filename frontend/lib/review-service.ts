import { api } from "@/lib/api"

export interface Review {
    id: number
    productId: number
    userId: string
    userName: string
    userImage?: string
    rating: number
    title: string
    comment: string
    date: string
    verified: boolean
    helpful: number
}

export interface CreateReviewData {
    product_id: number
    order_id: string
    rating: number
    title: string
    comment: string
}

export interface UpdateReviewData {
    rating?: number
    title?: string
    comment?: string
}

export const reviewService = {
    // Get reviews for a product
    getProductReviews: async (productId: number): Promise<Review[]> => {
        // In a real app, we would make an API call here
        // return api.get(`/reviews/product/${productId}`)

        // For now, we'll keep using the mock data or fetch from API if available
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/reviews/product/${productId}`)
            if (!response.ok) throw new Error('Failed to fetch reviews')
            const data = await response.json()

            if (data.success) {
                // Map backend response to frontend interface
                return data.data.map((r: any) => ({
                    id: r.id,
                    productId: r.product_id,
                    userId: r.user_id,
                    userName: r.user_name || 'Anonymous',
                    rating: r.rating,
                    title: r.title,
                    comment: r.comment,
                    date: new Date(r.created_at).toLocaleDateString(),
                    verified: r.is_verified === 1,
                    helpful: r.helpful_count
                }))
            }
            return []
        } catch (error) {
            console.error('Error fetching reviews:', error)
            return []
        }
    },

    // Create start review
    createReview: async (data: CreateReviewData) => {
        // Note: We need the auth token for this request
        const response = await api.post('/reviews', data)
        return response.data
    },

    // Update a review
    updateReview: async (id: number, data: UpdateReviewData) => {
        const response = await api.put(`/reviews/${id}`, data)
        return response.data
    },

    // Delete a review
    deleteReview: async (id: number) => {
        const response = await api.delete(`/reviews/${id}`)
        return response.data
    },

    // Mark review as helpful
    markHelpful: async (id: number) => {
        const response = await api.post(`/reviews/${id}/helpful`)
        return response.data
    }
}

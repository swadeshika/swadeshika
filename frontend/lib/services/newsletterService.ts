import { api } from '../api';

export interface Subscriber {
    id: number;
    email: string;
    is_active: boolean;
    subscribed_at: string;
    unsubscribed_at?: string;
}

export interface SubscribersResponse {
    subscribers: Subscriber[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export const newsletterService = {
    /**
     * Subscribe to newsletter
     * @param email 
     */
    subscribe: async (email: string) => {
        return api.post('/newsletter/subscribe', { email });
    },

    /**
     * Get all subscribers (Admin)
     * @param page 
     * @param limit 
     * @param isActive 
     */
    getSubscribers: async (page = 1, limit = 20, isActive?: boolean) => {
        let query = `?page=${page}&limit=${limit}`;
        if (isActive !== undefined) {
            query += `&isActive=${isActive}`;
        }
        return api.get<SubscribersResponse>(`/newsletter${query}`);
    },

    deleteSubscriber: async (id: number) => {
        return api.delete(`/newsletter/${id}`);
    }
};

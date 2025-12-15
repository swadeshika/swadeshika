import { api } from '@/lib/api';

export interface OrderItem {
    productName: string;
    variantName?: string;
    quantity: number;
    price: string;
    subtotal: string;
}

export interface OrderAddress {
    fullName: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
}

export interface OrderSummary {
    subtotal: string;
    discount: string;
    shipping: string;
    tax: string;
    total: string;
}

export interface Order {
    id: number | string;
    orderNumber: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus?: 'pending' | 'paid' | 'failed';
    totalAmount?: string; // For list view
    createdAt?: string; // For list view
    user?: { id: string; name?: string; email?: string }; // For list view
    items?: OrderItem[]; // Detail view
    address?: OrderAddress; // Detail view
    summary?: OrderSummary; // Detail view
    trackingNumber?: string;
}

interface OrdersResponse {
    orders: Order[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export const ordersService = {
    /**
     * Get all orders (Admin)
     */
    getAllOrders: async (params: { page?: number; limit?: number; status?: string; search?: string } = {}) => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', String(params.page));
        if (params.limit) query.append('limit', String(params.limit));
        if (params.status && params.status !== 'all') query.append('status', params.status);
        if (params.search) query.append('search', params.search);

        const res = await api.get<{ orders: Order[]; pagination: any }>(`/orders/admin/all?${query.toString()}`);
        return res.data;
    },

    /**
     * Get order details by ID
     */
    getOrderById: async (id: string) => {
        const res = await api.get<Order>(`/orders/${id}`);
        return res.data;
    },

    /**
     * Update order status (Admin)
     */
    updateStatus: async (id: string, status: string) => {
        const res = await api.put<{ message: string }>(`/orders/${id}/status`, { status });
        return res.data;
    },

    /**
     * Delete order (Admin)
     */
    deleteOrder: async (id: string) => {
        const res = await api.delete<{ message: string }>(`/orders/${id}`);
        return res.data;
    }
};

import { api, BASE_URL } from '@/lib/api';

export interface OrderItem {
    productName: string;
    variantName?: string;
    quantity: number;
    price: string;
    subtotal: string;
    image?: string;
    id?: string | number;
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
    customer?: { id: string; name: string; email: string }; // For list view (backend returns 'customer' now)
    user?: { id: string; name?: string; email?: string }; // Fallback/Legacy
    items?: OrderItem[]; // Detail view
    address?: OrderAddress; // Detail view
    summary?: OrderSummary; // Detail view
    trackingNumber?: string;
    estimatedDeliveryDate?: string | Date;
    timeline?: {
        status: string;
        date: string;
        completed: boolean;
    }[];
    tracking?: {
        carrier: string;
        trackingNumber: string;
        estimatedDelivery: string;
    };
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
        return res.data.data;
    },

    /**
     * Get order details by ID
     */
    getOrderById: async (id: string) => {
        const res = await api.get<Order>(`/orders/${id}`);
        return res.data.data;
    },

    /**
     * Update order status (Admin)
     */
    updateStatus: async (id: string, status: string, trackingNumber?: string) => {
        const res = await api.put<{ message: string }>(`/orders/${id}/status`, { status, trackingNumber });
        return res.data;
    },

    /**
     * Delete order (Admin)
     */
    deleteOrder: async (id: string) => {
        const res = await api.delete<{ success?: boolean; message?: string }>(`/orders/${id}`);
        return res.data;
    },

    /**
     * Get my orders (User)
     */
    getMyOrders: async (params: { page?: number; limit?: number; status?: string } = {}) => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', String(params.page));
        if (params.limit) query.append('limit', String(params.limit));
        if (params.status && params.status !== 'all') query.append('status', params.status);

        const res = await api.get<{ orders: Order[]; pagination: any }>(`/orders?${query.toString()}`);
        return res.data.data;
    },

    /**
     * Create a new order (User)
     */
    createOrder: async (orderData: {
        items: any[];
        shippingAddress: any;
        billingAddress: any;
        paymentMethod: string;
        subtotal: number;
        tax: number;
        shippingCost: number;
        totalAmount: number;
        phone?: string;
        email?: string;
        couponCode?: string | null;
        notes?: string;
    }) => {
        const res = await api.post<{ message: string; orderId: string }>(`/orders`, orderData);
        return res.data;
    },

    /**
     * Download invoice PDF for order
     */
    downloadInvoice: async (id: string) => {
        if (typeof window === 'undefined') throw new Error('Client only');
        // Build URL using BASE_URL exported from api
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const res = await fetch(`${BASE_URL}/orders/${id}/invoice`, {
            method: 'GET',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            }
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Failed to download invoice');
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return true;
    },

    /**
     * Track Order (Public)
     */
    trackOrder: async (orderId: string, email: string) => {
        const res = await api.post<{ data: any }>(`/orders/track`, { orderId, email });
        return res.data.data;
    }
};


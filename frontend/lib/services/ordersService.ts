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
    customer?: { id: string; name: string; email: string }; // For list view (backend returns 'customer' now)
    user?: { id: string; name?: string; email?: string }; // Fallback/Legacy
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

        const res = await api.get<{ success?: boolean; data?: { orders: Order[]; pagination: any } }>(`/orders/admin/all?${query.toString()}`);
        // Backend responses use { success, data: { orders, pagination } }
        // Unwrap if necessary to return { orders, pagination } directly.
        return (res.data && (res.data.data || res.data)) as any;
    },

    /**
     * Create a new order (User)
     */
    createOrder: async (orderData: any) => {
        const res = await api.post<{ success?: boolean; data?: any; message?: string }>('/orders', orderData);
        return res.data && res.data.data ? res.data.data : res.data;
    },

    /**
     * Get order details by ID
     */
    getOrderById: async (id: string) => {
        const res = await api.get<{ success?: boolean; data?: Order }>(`/orders/${id}`);
        return res.data && res.data.data ? res.data.data : res.data;
    },

    /**
     * Update order status (Admin)
     */
    updateStatus: async (id: string, status: string) => {
        const res = await api.put<{ success?: boolean; message?: string }>(`/orders/${id}/status`, { status });
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
     * Export orders (Admin)
     */
    exportOrders: async () => {
        // Use window.open for downloading file if method is GET and returns binary/blob
        // OR use fetch with blob response manually if auth headers needed (which they are)
        // Since 'api' wrapper handles auth, let's use it but handle blob.
        // Actually, easiest for CSV download with auth is to use a direct fetch with token
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/orders/admin/export`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Export failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
};

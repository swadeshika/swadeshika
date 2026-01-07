import { api } from '@/lib/api';

export interface Customer {
     id: string;
     first_name: string;
     last_name: string;
     email: string;
     phone?: string;
     status: string;
     join_date: string;
     orders?: number;
     totalSpent?: number;
}

interface CustomersResponse {
     success: boolean;
     data: Customer[];
     pagination: {
          page: number;
          limit: number;
          totalItems: number;
          totalPages: number;
     };
}

export const customersService = {
     getAll: async (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
          const query = new URLSearchParams();
          if (params.page) query.append('page', String(params.page));
          if (params.limit) query.append('limit', String(params.limit));
          if (params.search) query.append('search', params.search);
          if (params.status && params.status !== 'All') query.append('status', params.status);

          const res = await api.get<{ success?: boolean; data?: CustomersResponse['data']; pagination?: any }>(`/customers?${query.toString()}`);
          // Return the full backend response body so callers can read `.data` and `.pagination`
          return res.data as any;
     },

     getById: async (id: string) => {
          const res = await api.get<{ success: boolean; data: Customer }>(`/customers/${id}`);
          return res.data.data;
     },

     update: async (id: string, data: Partial<Customer>) => {
          const res = await api.put<{ success: boolean; message: string }>(`/customers/${id}`, data);
          return res.data;
     },

     delete: async (id: string) => {
          const res = await api.delete<{ success: boolean; message: string }>(`/customers/${id}`);
          return res.data;
     }
};

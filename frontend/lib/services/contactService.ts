import { api } from '@/lib/api';

export interface ContactSubmission {
     id: number;
     name: string;
     email: string;
     phone?: string;
     subject: string;
     order_number?: string;
     message: string;
     status: 'new' | 'read' | 'replied' | 'archived';
     created_at: string;
}

export interface ContactQuery {
     page?: number;
     limit?: number;
     status?: string;
     search?: string;
}

export interface ContactResponse {
     submissions: ContactSubmission[];
     total: number;
     page: number;
     limit: number;
     pages: number;
}

export const contactService = {
     getAll: async (query: ContactQuery = {}) => {
          const queryString = new URLSearchParams(query as any).toString();
          return api.get<ContactResponse>(`/contact?${queryString}`);
     },

     getById: async (id: number | string) => {
          return api.get<ContactSubmission>(`/contact/${id}`);
     },

     submit: async (data: Partial<ContactSubmission>) => {
          return api.post('/contact', data);
     },

     updateStatus: async (id: number | string, status: string) => {
          return api.put(`/contact/${id}`, { status });
     },

     reply: async (id: number | string, message: string) => {
          return api.post(`/contact/${id}/reply`, { message });
     },

     delete: async (id: number | string) => {
          return api.delete(`/contact/${id}`);
     }
};

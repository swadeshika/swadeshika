import { api } from './api';

export interface BlogAuthor {
    id?: string | number; // Backend uses INT now
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    social_links?: {
        twitter?: string;
        facebook?: string;
        instagram?: string;
        linkedin?: string;
    };
    created_at?: string;
}

export const blogAuthorService = {
    async getAllAuthors(): Promise<BlogAuthor[]> {
        const response = await api.get<{ success: boolean; data: BlogAuthor[] }>('/admin/blog/authors');
        return response.data.data;
    },

    async getAuthor(id: string | number): Promise<BlogAuthor> {
        const response = await api.get<{ success: boolean; data: BlogAuthor }>(`/admin/blog/authors/${id}`);
        return response.data.data;
    },

    async createAuthor(data: BlogAuthor): Promise<BlogAuthor> {
        const response = await api.post<{ success: boolean; data: BlogAuthor }>('/admin/blog/authors', data);
        return response.data.data;
    },

    async updateAuthor(id: string | number, data: Partial<BlogAuthor>): Promise<BlogAuthor> {
        const response = await api.put<{ success: boolean; data: BlogAuthor }>(`/admin/blog/authors/${id}`, data);
        return response.data.data;
    },

    async deleteAuthor(id: string | number): Promise<void> {
        await api.delete(`/admin/blog/authors/${id}`);
    }
};

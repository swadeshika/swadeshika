import { api } from './api';

/**
 * Blog Category Interface
 */
export interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

/**
 * Blog Post Interface
 */
export interface BlogPost {
    id?: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image?: string;
    author_id?: string;
    category_id?: number;
    tags?: string[];
    status: 'draft' | 'published' | 'archived';
    published_at?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Blog Service
 * Handles all blog-related API calls
 */
export const blogService = {
    // Blog Categories
    async getActiveCategories(): Promise<BlogCategory[]> {
        const response = await api.get<BlogCategory[]>('/blog/categories/active');
        return response.data.data;
    },

    async getAllCategories(): Promise<BlogCategory[]> {
        const response = await api.get<BlogCategory[]>('/blog/categories');
        return response.data.data;
    },

    async getCategory(id: number): Promise<BlogCategory> {
        const response = await api.get<BlogCategory>(`/blog/categories/${id}`);
        return response.data.data;
    },

    async createCategory(data: Partial<BlogCategory>): Promise<BlogCategory> {
        const response = await api.post<BlogCategory>('/blog/categories', data);
        return response.data.data;
    },

    async updateCategory(id: number, data: Partial<BlogCategory>): Promise<BlogCategory> {
        const response = await api.put<BlogCategory>(`/blog/categories/${id}`, data);
        return response.data.data;
    },

    async deleteCategory(id: number): Promise<void> {
        await api.delete(`/blog/categories/${id}`);
    },

    // Blog Posts
    async getAllPosts(params?: { page?: number; limit?: number; status?: string; category?: string }): Promise<BlogPost[]> {
        const queryString = new URLSearchParams(params as any).toString();
        const endpoint = queryString ? `/blog?${queryString}` : '/blog';
        const response = await api.get<BlogPost[]>(endpoint);
        return response.data.data;
    },

    async getPostBySlug(slug: string): Promise<BlogPost> {
        const response = await api.get<BlogPost>(`/blog/${slug}`);
        return response.data.data;
    },

    async createPost(data: Partial<BlogPost>): Promise<BlogPost> {
        const response = await api.post<BlogPost>('/admin/blog', data);
        return response.data.data;
    },

    async updatePost(id: number, data: Partial<BlogPost>): Promise<BlogPost> {
        const response = await api.put<BlogPost>(`/admin/blog/${id}`, data);
        return response.data.data;
    },

    async deletePost(id: number): Promise<void> {
        await api.delete(`/admin/blog/${id}`);
    },
};

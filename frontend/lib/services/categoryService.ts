import { api } from '@/lib/api';

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    parent_id?: number | null;
    display_order?: number;
    product_count?: number; // Backend returns this as product_count
    parent_name?: string; // Optional helper if we join it in backend or frontend
    subcategories?: Category[]; // For nested view
}

export const categoryService = {
    /**
     * Get all categories
     */
    async getAllCategories(): Promise<Category[]> {
        // The backend returns { success: true, data: Category[] }
        const response = await api.get<Category[]>('/categories');
        return response.data.data;
    },

    /**
     * Create a new category
     */
    async createCategory(data: Partial<Category>): Promise<Category> {
        const response = await api.post<Category>('/categories', data);
        return response.data.data;
    },

    /**
     * Update an existing category
     */
    async updateCategory(id: number | string, data: Partial<Category>): Promise<Category> {
        const response = await api.put<Category>(`/categories/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete a category
     */
    async deleteCategory(id: number | string): Promise<boolean> {
        await api.delete(`/categories/${id}`);
        return true;
    }
};

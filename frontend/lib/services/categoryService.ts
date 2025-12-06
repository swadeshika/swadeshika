import { api } from '@/lib/api';

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parent_id?: number | null;
}

export const categoryService = {
    async getAllCategories(): Promise<Category[]> {
        // The backend returns { success: true, data: Category[] }
        // api.get<T> expects T to be the type of the 'data' property in the response.
        const response = await api.get<Category[]>('/categories');
        return response.data.data;
    }
};

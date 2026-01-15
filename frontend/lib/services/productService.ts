import { api } from '@/lib/api';

export interface Product {
    id: number;
    name: string;
    slug: string;
    description?: string;
    short_description?: string;
    category_id?: number;
    sku: string;
    price: number;
    compare_price?: number;
    cost_price?: number;
    weight?: number;
    weight_unit?: string;
    in_stock: boolean;
    stock_quantity: number;
    low_stock_threshold?: number;
    rating: number;
    review_count: number;
    badge?: string;
    is_active: boolean;
    is_featured: boolean;
    meta_title?: string;
    meta_description?: string;
    created_at?: string;
    primary_image?: string; // from View
    category?: string; // added to fix missing property errors
    category_name?: string; // added to fix missing property errors
    images?: ProductImage[];
    features?: string[];
    specifications?: Record<string, string>;
    tags?: string[];
}

export interface ProductImage {
    id: number;
    product_id: number;
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
    display_order: number;
}

export interface ProductQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    min_price?: number;
    max_price?: number;
    sort?: string;
    view?: 'list' | 'admin' | 'full';
    fields?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export const productService = {
    /**
     * Get all products with filtering and pagination
     */
    async getAllProducts(params: ProductQueryParams = {}) {
        // Convert params to query string
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const response = await api.get<{ products: Product[], total: number, page: number, pages: number }>(`/products?${queryParams.toString()}`);
        return response.data.data; // The backend returns { success: true, data: { users: [], ... } } - wait, check backend response structure
    },

    /**
     * Get single product by ID or Slug
     */
    async getProduct(idOrSlug: string | number) {
        const response = await api.get<Product>(`/products/${idOrSlug}`);
        return response.data.data;
    },

    // --- Admin Methods ---

    async createProduct(data: Partial<Product>) {
        const response = await api.post<Product>('/products', data);
        return response.data.data;
    },

    async updateProduct(id: number, data: Partial<Product>) {
        const response = await api.put<Product>(`/products/${id}`, data);
        return response.data.data;
    },

    async deleteProduct(id: number) {
        await api.delete(`/products/${id}`);
    },

    /**
     * Get all categories
     */
    async getAllCategories() {
        const response = await api.get<Category[]>('/categories');
        return response.data.data;
    }
};

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    parent_id?: number;
    is_active?: boolean;
}

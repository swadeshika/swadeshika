import { api } from './api';

export interface Coupon {
     id: number;
     code: string;
     description?: string;
     discount_type: 'percentage' | 'fixed';
     discount_value: number;
     min_order_amount?: number;
     max_discount_amount?: number;
     usage_limit?: number;
     used_count: number;
     per_user_limit?: number;
     valid_from?: string;
     valid_until?: string;
     is_active: boolean;
     created_at?: string;
     product_ids?: number[];
     category_ids?: number[];
}

export const couponService = {
     // Admin: Get all coupons
     async getAllCoupons(): Promise<Coupon[]> {
          const response = await api.get<Coupon[]>('/coupons');
          return response.data.data;
     },

     // Admin: Get single coupon
     async getCoupon(id: number): Promise<Coupon> {
          const response = await api.get<Coupon>(`/coupons/${id}`);
          return response.data.data;
     },

     // Admin: Create coupon
     async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
          const response = await api.post<Coupon>('/coupons', data);
          return response.data.data;
     },

     // Admin: Update coupon
     async updateCoupon(id: number, data: Partial<Coupon>): Promise<Coupon> {
          const response = await api.put<Coupon>(`/coupons/${id}`, data);
          return response.data.data;
     },

     // Admin: Delete coupon
     async deleteCoupon(id: number): Promise<void> {
          await api.delete(`/coupons/${id}`);
     },

     // User: Validate coupon
     async validateCoupon(code: string, orderTotal: number, cartItems: any[] = []): Promise<{
          isValid: boolean;
          discountAmount: number;
          coupon?: Coupon;
          message?: string;
     }> {
          try {
               const response = await api.post<{
                    isValid: boolean;
                    discountAmount: number;
                    coupon?: Coupon;
                    message?: string;
               }>('/coupons/validate', {
                    code,
                    orderTotal,
                    cartItems
               });
               return response.data.data;
          } catch (error: any) {
               return {
                    isValid: false,
                    discountAmount: 0,
                    message: error.message || 'Invalid coupon'
               };
          }
     },

     // Helpers for restrictions
     async getProducts(): Promise<{ id: number, name: string }[]> {
          const response = await api.get<any[]>('/products');
          // Standardize response: if items has property 'products' or is array
          const items = Array.isArray(response.data.data) ? response.data.data : (response.data.data as any).products || [];
          return items.map((p: any) => ({ id: p.id, name: p.name }));
     },

     async getCategories(): Promise<{ id: number, name: string }[]> {
          const response = await api.get<any[]>('/categories');
          // Standardize response
          const items = Array.isArray(response.data.data) ? response.data.data : (response.data.data as any).categories || [];
          return items.map((c: any) => ({ id: c.id, name: c.name }));
     }
};

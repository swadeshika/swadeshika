const ProductModel = require('../models/productModel');

class ProductService {

    /**
     * Get all products with advanced filtering and view presets
     */
    static async getAllProducts(query) {
        let { view, fields, ...filters } = query;
        let selectedFields = [];

        // 1. Handle 'view' presets
        if (view === 'list') {
            selectedFields = ['name', 'price', 'primary_image', 'average_rating', 'weight', 'stock_quantity', 'in_stock', 'slug'];
        } else if (view === 'admin') {
            /**
             * CRITICAL FIX: Missing in_stock in Admin View
             * =============================================
             * 
             * PROBLEM:
             * - Admin view was not selecting in_stock field
             * - Frontend couldn't determine stock status
             * - All products showed "Out of Stock"
             * 
             * SOLUTION:
             * - Added 'in_stock' to admin view fields
             * - Now admin panel can show correct stock status
             */
            // Admin view fields (do not request non-existent columns)
            selectedFields = ['name', 'sku', 'stock_quantity', 'in_stock', 'price', 'category_id', 'is_featured', 'is_active'];
        }

        // 2. Handle 'fields' query param (overrides or appends to view)
        // If user specifically asks for fields, we prioritize that.
        // Or we could merge them. Let's prioritize explicit 'fields' if provided.
        if (fields) {
            selectedFields = fields.split(',').map(f => f.trim());
        }

        // If no view and no fields, selectedFields remains empty [] -> Model will select *

        // 3. Determine 'is_active' filter logic
        // If view is 'admin', we want ALL products (active & inactive).
        // If view is NOT 'admin' (storefront), we typically ONLY want active products.
        // However, if the query explicitly specifies 'isActive' (e.g. string 'true' or 'false'), we respect that.
        // Otherwise, default to true (Active only) for non-admin views.
        
        let activeFilter = filters.isActive;
        if (view !== 'admin' && activeFilter === undefined) {
             activeFilter = 'true';
        }

        // 4. Call Model
        return await ProductModel.findAll({ 
            ...filters, 
            minPrice: filters.min_price || filters.minPrice,
            maxPrice: filters.max_price || filters.maxPrice,
            isActive: activeFilter, 
            fields: selectedFields.length ? selectedFields.join(',') : null 
        });
    }

    static async getProductById(id) {
        return await ProductModel.findByIdOrSlug(id);
    }

    static async createProduct(data) {
        return await ProductModel.create(data);
    }

    static async updateProduct(id, data) {
        const result = await ProductModel.update(id, data);
        
        // Check for low stock and send alert if needed
        if (data.stock_quantity !== undefined) {
            try {
                const { checkAndAlertLowStock } = require('./stockAlertService');
                const product = await ProductModel.findByIdOrSlug(id);
                
                if (product) {
                    const threshold = product.low_stock_threshold || 10;
                    await checkAndAlertLowStock(
                        product.id,
                        product.stock_quantity,
                        product.name,
                        threshold
                    );
                }
            } catch (err) {
                console.error('Stock alert check failed:', err);
                // Don't fail the update if notification fails
            }
        }
        
        return result;
    }

    static async deleteProduct(id) {
        return await ProductModel.delete(id);
    }
}

module.exports = ProductService;

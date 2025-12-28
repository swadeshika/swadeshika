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
            selectedFields = ['name', 'price', 'primary_image', 'average_rating', 'weight'];
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
            selectedFields = ['name', 'sku', 'stock_quantity', 'in_stock', 'price', 'category_id', 'is_featured'];
        }

        // 2. Handle 'fields' query param (overrides or appends to view)
        // If user specifically asks for fields, we prioritize that.
        // Or we could merge them. Let's prioritize explicit 'fields' if provided.
        if (fields) {
            selectedFields = fields.split(',').map(f => f.trim());
        }

        // If no view and no fields, selectedFields remains empty [] -> Model will select *

        // 3. Call Model
        return await ProductModel.findAll({ ...filters, fields: selectedFields.length ? selectedFields.join(',') : null });
    }

    static async getProductById(id) {
        return await ProductModel.findByIdOrSlug(id);
    }

    static async createProduct(data) {
        return await ProductModel.create(data);
    }

    static async updateProduct(id, data) {
        return await ProductModel.update(id, data);
    }

    static async deleteProduct(id) {
        return await ProductModel.delete(id);
    }
}

module.exports = ProductService;

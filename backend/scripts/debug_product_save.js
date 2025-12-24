const db = require('../src/config/db');
const ProductService = require('../src/services/productService');

async function debugProductSave() {
    try {
        console.log('🚀 Starting Debug Product Save...');

        // 1. Check Categories
        const [categories] = await db.query('SELECT * FROM categories LIMIT 5');
        console.log('📂 Existing Categories:', categories.map(c => ({ id: c.id, name: c.name })));

        if (categories.length === 0) {
            console.error('❌ No categories found! Product creation will fail for category_id=1.');
            // Create a dummy category
            await db.query("INSERT INTO categories (name, slug) VALUES ('Debug Category', 'debug-cat')");
            console.log('✅ Created dummy category (Check ID in next run)');
        }

        const categoryId = categories.length > 0 ? categories[0].id : 1;

        // 2. Prepare Payload
        const payload = {
            name: "Debug Product " + Date.now(),
            slug: "debug-product-" + Date.now(),
            description: "<p>Test Description</p>",
            short_description: "Short desc",
            price: 100,
            compare_price: 120,
            category_id: categoryId,
            stock_quantity: 10,
            sku: "DEBUG-" + Date.now(), // Unique SKU
            weight: 0.5,
            weight_unit: "kg",
            in_stock: true,
            is_active: true,
            meta_title: "Meta Title",
            meta_description: "Meta Desc",
            tags: ["debug"],
            features: ["Feature 1"],
            specifications: { "Material": "Cotton" },
            images: [],
            variants: []
        };

        console.log('📦 Attempting to create product with payload:', JSON.stringify(payload, null, 2));

        const newProduct = await ProductService.createProduct(payload);
        console.log('✅ Product created successfully! ID:', newProduct);

    } catch (error) {
        console.error('❌ Product Creation Failed:', error);
    } finally {
        process.exit();
    }
}

debugProductSave();

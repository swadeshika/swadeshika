const db = require('../src/config/db');
const ProductModel = require('../src/models/productModel');
require('dotenv').config();

async function run() {
    try {
        await db.connectDB();
        // console.log('Connected to DB');

        // Fetch a valid category
        const [categories] = await db.query('SELECT id FROM categories LIMIT 1');
        if (categories.length === 0) {
            console.error("No categories found! Please create a category first.");
            process.exit(1);
        }
        const validCategoryId = categories[0].id;
        // console.log(`Using Category ID: ${validCategoryId}`);

        const productData = {
            name: "Premium Saffron (Kesar) with Variations",
            slug: `premium-saffron-kesar-${Date.now()}`, // Ensure uniqueness
            description: "World's finest saffron directly from Kashmir. Available in multiple packs.",
            short_description: "Pure Kashmiri Saffron",
            category_id: validCategoryId, // Use dynamic ID
            sku: `SAFFRON-VAR-${Date.now()}`,
            price: 500, // Base price
            compare_price: 600,
            stock_quantity: 100, // Aggregate stock
            in_stock: true,
            is_active: true,
            is_featured: true,
            meta_title: "Buy Premium Saffron Online",
            meta_description: "Best quality saffron in India.",
            
            // Variations
            variants: [
                {
                    name: "1g Pack",
                    sku: "SAFFRON-1G",
                    price: 500,
                    compare_price: 600,
                    stock_quantity: 50
                },
                {
                    name: "5g Pack",
                    sku: "SAFFRON-5G",
                    price: 2400,
                    compare_price: 2800,
                    stock_quantity: 30
                },
                {
                    name: "10g Gift Box",
                    sku: "SAFFRON-10G",
                    price: 4500,
                    compare_price: 5000,
                    stock_quantity: 20
                }
            ],

            // Images (Sample URLs)
            images: [
                {
                    url: "https://via.placeholder.com/800x800.png?text=Saffron+Main",
                    alt_text: "Saffron Main",
                    is_primary: true,
                    display_order: 1
                },
                {
                    url: "https://via.placeholder.com/800x800.png?text=Saffron+Open",
                    alt_text: "Saffron Open Jar",
                    is_primary: false,
                    display_order: 2
                }
            ],

            // features
            features: [
                "100% Pure & Natural",
                "Direct from Farmers",
                "Lab Tested Grade A++"
            ],

            // Specifications
            specifications: {
                "Origin": "Kashmir, India",
                "Grade": "Mongra",
                "Shelf Life": "24 Months"
            }
        };

        // console.log("Creating product...");
        const newProductId = await ProductModel.create(productData);
        // console.log(`Successfully created product with ID: ${newProductId}`);
        // console.log(`Check it at /products/${productData.slug}`);

        process.exit(0);
    } catch (error) {
        console.error("Error creating product:", error);
        process.exit(1);
    }
}

run();

const db = require('./src/config/db');

(async () => {
    await db.connectDB();
    
    // Get product images for Pure Desi Cow Ghee
    const [images] = await db.query(`
        SELECT 
            pi.id,
            pi.product_id,
            pi.image_url,
            pi.is_primary,
            pi.display_order,
            p.name as product_name
        FROM product_images pi
        JOIN products p ON pi.product_id = p.id
        WHERE p.name LIKE '%Ghee%'
        ORDER BY pi.display_order
    `);
    
    console.log('=== PRODUCT IMAGES ===');
    images.forEach(img => {
        console.log(`\nImage ID: ${img.id}`);
        console.log(`  Product: ${img.product_name}`);
        console.log(`  URL: ${img.image_url}`);
        console.log(`  is_primary: ${img.is_primary} (type: ${typeof img.is_primary})`);
        console.log(`  display_order: ${img.display_order}`);
    });
    
    console.log(`\n\nTotal images: ${images.length}`);
    console.log(`Primary images: ${images.filter(i => i.is_primary === 1).length}`);
    console.log(`Gallery images: ${images.filter(i => i.is_primary === 0).length}`);
    
    process.exit(0);
})();

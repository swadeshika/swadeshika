const BASE_URL = 'http://localhost:5000/api/v1/products';

async function runVerification() {
    try {
        console.log('🚀 Starting Product API Verification...');

        // Helper for fetch
        const request = async (url, method = 'GET', body = null) => {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' },
            };
            if (body) options.body = JSON.stringify(body);

            const res = await fetch(url, options);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || res.statusText);
            }
            return data;
        };

        // 1. Create a Product
        console.log('\n1. Creating a new product...');
        const newProduct = {
            name: 'Test Product ' + Date.now(),
            // slug: 'test-product-' + Date.now(), // Testing auto-generation
            description: 'This is a test product',
            short_description: 'Test product short desc',
            sku: 'TEST-' + Date.now(),
            price: 999,
            category_id: 1, // Using seeded category ID
            stock_quantity: 10,
            images: [
                { url: '/test-image.jpg', alt_text: 'Test Image', is_primary: true }
            ],
            variants: [
                { name: 'Variant 1', sku: 'TEST-VAR-1-' + Date.now(), price: 100 }
            ],
            features: ['Feature 1', 'Feature 2'],
            specifications: { 'Color': 'Red', 'Size': 'L' },
            tags: ['test', 'demo']
        };

        const createRes = await request(BASE_URL, 'POST', newProduct);
        const createdProduct = createRes.data;
        console.log('✅ Product Created:', createdProduct.id, createdProduct.name);

        // 2. Get All Products
        console.log('\n2. Fetching all products...');
        const getAllRes = await request(BASE_URL);
        console.log(`✅ Fetched ${getAllRes.data.products.length} products`);

        // Verify our product is in the list
        const foundInList = getAllRes.data.products.find(p => p.id === createdProduct.id);
        if (foundInList) {
            console.log('✅ Created product found in list');
        } else {
            console.error('❌ Created product NOT found in list');
        }

        // 3. Get Single Product
        console.log('\n3. Fetching single product...');
        const getOneRes = await request(`${BASE_URL}/${createdProduct.id}`);
        const fetchedProduct = getOneRes.data;
        console.log('✅ Fetched Product:', fetchedProduct.id, fetchedProduct.name);

        // Verify details
        if (fetchedProduct.features.length === 2 && fetchedProduct.specifications.Color === 'Red') {
            console.log('✅ Product details verified');
        } else {
            console.error('❌ Product details mismatch');
        }

        // 4. Update Product
        console.log('\n4. Updating product...');
        const updateData = {
            name: createdProduct.name + ' (Updated)',
            price: 1299
        };
        const updateRes = await request(`${BASE_URL}/${createdProduct.id}`, 'PUT', updateData);
        console.log('✅ Product Updated:', updateRes.data.name, updateRes.data.price);

        // 5. Delete Product
        console.log('\n5. Deleting product...');
        await request(`${BASE_URL}/${createdProduct.id}`, 'DELETE');
        console.log('✅ Product Deleted');

        // Verify deletion
        try {
            await request(`${BASE_URL}/${createdProduct.id}`);
            console.error('❌ Product still exists after deletion');
        } catch (error) {
            console.log('✅ Verified product is gone (404)');
        }

        console.log('\n✨ Verification Complete!');

    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
    }
}

runVerification();

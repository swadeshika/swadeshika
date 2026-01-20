const API_URL = 'http://localhost:5000/api/v1/products';

async function testSort(label, paramsObj, checkFn) {
    try {
        const params = new URLSearchParams(paramsObj);
        console.log(`Testing ${label} (${params.toString()})...`);
        const res = await fetch(`${API_URL}?${params.toString()}`);
        const json = await res.json();
        
        if (!json.success) {
            console.error('API Error:', json);
            return;
        }

        const products = json.data.products;
        console.log(`Got ${products.length} products.`);

        if (products.length === 0) {
            console.warn('⚠️ No products found, strictly passing but inconclusive.');
            return;
        }

        const passed = checkFn(products);
        if (passed) {
            console.log(`✅ ${label} working.`);
        } else {
            console.error(`❌ ${label} FAILED.`);
            console.log('Values:', products.map(p => {
                if (paramsObj.sort && paramsObj.sort.includes('price')) return p.price;
                return p.created_at; 
            }));
        }
    } catch (err) {
        console.error(`Error testing ${label}:`, err.message);
    }
}

async function run() {
    // Standard Price Sort
    await testSort('Price Low-High', { sort: 'price_asc', min_price: 0, max_price: 10000, limit: 5 }, (products) => {
        for (let i = 0; i < products.length - 1; i++) {
            if (products[i].price > products[i+1].price) return false;
        }
        return true;
    });

    // Filtered Price Sort
    // Assuming we have products in range 100-5000
    await testSort('Price High-Low (Range 100-5000)', { sort: 'price_desc', min_price: 100, max_price: 5000, limit: 5 }, (products) => {
        for (let i = 0; i < products.length - 1; i++) {
            if (products[i].price < products[i+1].price) return false;
            if (products[i].price < 100 || products[i].price > 5000) {
                console.error('Price out of range:', products[i].price);
                return false;
            }
        }
        return true;
    });
    // Test Featured
    await testSort('Featured', { sort: 'featured', limit: 5 }, (products) => {
        // Should have is_featured = 1 first
        // Finding transitions
        let foundNonFeatured = false;
        for (let i = 0; i < products.length; i++) {
            const isFeatured = products[i].is_featured;
            if (foundNonFeatured && isFeatured) {
                console.error('Found featured product after non-featured product!');
                return false;
            }
            if (!isFeatured) foundNonFeatured = true;
        }
        return true;
    });
}

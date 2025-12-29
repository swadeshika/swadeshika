
// Native fetch used


async function testReview() {
    try {
        const response = await fetch('http://localhost:5000/api/v1/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Assuming we can test without auth or we need to login first. 
                // Since this uses authMiddleware, we likely need a token.
                // But let's try to hit it and see if we get 401 (Auth) or 400 (Validation).
                // If we get 401, we know validation passed auth check at least? No, middleware order.
                // Auth is first.
                // We need a valid token.
            },
            body: JSON.stringify({
                product_id: 6,
                order_id: "ORD-MOCK-001",
                rating: 5,
                title: "Test Review",
                comment: "This is a great product I really loved it"
            })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Body:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Error:", error);
    }
}

testReview();

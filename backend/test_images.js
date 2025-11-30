const fetch = require('node-fetch');

async function testImages() {
    try {
        const timestamp = Date.now();
        const sellerEmail = `seller${timestamp}@example.com`;

        // Register Seller
        console.log('Registering Seller...');
        let res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: `seller${timestamp}`, email: sellerEmail, password: 'password123', role: 'service_provider' })
        });
        let data = await res.json();
        const sellerToken = (await (await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: sellerEmail, password: 'password123' })
        })).json()).token;

        // Create Service with Links
        console.log('Creating Service with Links...');
        const FormData = require('form-data');
        const form = new FormData();
        form.append('title', 'Service with Links ' + timestamp);
        form.append('description', 'Test Description');
        form.append('price', '150');
        form.append('category', 'Videography');
        form.append('image_links', 'https://example.com/1.jpg, https://example.com/2.jpg');

        res = await fetch('http://localhost:5000/api/services', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sellerToken}`,
                ...form.getHeaders()
            },
            body: form
        });
        data = await res.json();
        console.log('Service Created:', data);

        // Fetch Services
        console.log('Fetching Services...');
        res = await fetch('http://localhost:5000/api/services');
        const services = await res.json();
        const service = services.find(s => s.id === data.serviceId);

        console.log('Fetched Service Images:', service.images);

        if (service.images && service.images.length === 2 && service.images.includes('https://example.com/1.jpg')) {
            console.log('SUCCESS: Service has correct image links.');
        } else {
            console.log('FAILURE: Service images mismatch.');
        }

    } catch (error) {
        console.error('Test Error:', error);
    }
}

testImages();

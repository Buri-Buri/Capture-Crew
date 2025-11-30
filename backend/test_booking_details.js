const fetch = require('node-fetch');

async function testBookingDetails() {
    try {
        const timestamp = Date.now();
        const sellerEmail = `seller${timestamp}@example.com`;
        const customerEmail = `cust${timestamp}@example.com`;

        // Register Seller
        console.log('Registering Seller...');
        let res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: `seller${timestamp}`, email: sellerEmail, password: 'password123', role: 'seller' })
        });
        let data = await res.json();
        const sellerToken = (await (await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: sellerEmail, password: 'password123' })
        })).json()).token;

        // Create Service
        console.log('Creating Service...');
        const formData = new URLSearchParams();
        formData.append('title', 'Test Service');
        formData.append('description', 'Test Description');
        formData.append('price', '100');
        formData.append('category', 'Photography');
        formData.append('location', 'Test Location');

        // Note: Using URLSearchParams for simplicity, but backend expects FormData with files.
        // However, backend might handle missing files gracefully or we need to use form-data package.
        // Let's try to fetch existing services first to avoid complexity of file upload in test.

        // Actually, let's just fetch existing services.
        res = await fetch('http://localhost:5000/api/services');
        const services = await res.json();
        let serviceId;
        if (services.length > 0) {
            serviceId = services[0].id;
            console.log('Using existing service ID:', serviceId);
        } else {
            console.log('No services found. Cannot test booking.');
            return;
        }

        // Register Customer
        console.log('Registering Customer...');
        res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: `cust${timestamp}`, email: customerEmail, password: 'password123', role: 'customer' })
        });

        // Login Customer
        console.log('Logging in Customer...');
        res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: customerEmail, password: 'password123' })
        });
        const loginData = await res.json();
        const token = loginData.token;

        if (!token) {
            console.error('Login failed:', loginData);
            return;
        }

        // Create Booking with Details
        console.log('Creating Booking...');
        res = await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                service_id: serviceId,
                booking_date: '2025-12-25',
                contact_info: '123-456-7890',
                location: '123 Test St'
            })
        });
        data = await res.json();
        console.log('Booking Response:', data);

        if (res.ok && data.bookingId) {
            console.log('SUCCESS: Booking created with details.');
        } else {
            console.log('FAILURE: Booking creation failed.');
        }

    } catch (error) {
        console.error('Test Error:', error);
    }
}

testBookingDetails();

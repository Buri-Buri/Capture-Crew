const fetch = require('node-fetch');

async function testSellerBookings() {
    try {
        // 1. Login as seller (use the user who created the service in previous tests)
        // In test_booking.js, we booked service ID 2. We need to find who owns it.
        // For simplicity, I'll just login as 'Sajid0' or create a new seller and book their service.

        // Let's create a new seller, create a service, create a customer, book it, then check seller bookings.
        const timestamp = Date.now();
        const sellerEmail = `seller${timestamp}@example.com`;
        const customerEmail = `customer${timestamp}@example.com`;

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

        // Create Service
        console.log('Creating Service...');
        // Need to use form-data for image upload, but for this test I'll skip image or use a dummy if required.
        // The backend requires 'image' field? Let's check serviceRoutes.js.
        // upload.single('image') is used. If I don't send image, it might fail or just have no image.
        // Let's try sending without image first, or use a simple text field if allowed.
        // Actually, I can just use a dummy text for now, or skip if not strictly required by controller logic (it checks req.file).
        // If req.file is missing, image_url will be null.

        // To send multipart/form-data with node-fetch, I need 'form-data' package.
        const FormData = require('form-data');
        const form = new FormData();
        form.append('title', 'Test Service ' + timestamp);
        form.append('description', 'Test Description');
        form.append('price', '100');
        form.append('category', 'Photography');

        res = await fetch('http://localhost:5000/api/services', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sellerToken}`,
                ...form.getHeaders()
            },
            body: form
        });
        data = await res.json();
        const serviceId = data.serviceId;
        console.log('Service Created ID:', serviceId);

        // Register Customer
        console.log('Registering Customer...');
        await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: `customer${timestamp}`, email: customerEmail, password: 'password123', role: 'customer' })
        });
        const customerToken = (await (await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: customerEmail, password: 'password123' })
        })).json()).token;

        // Book Service
        console.log('Booking Service...');
        await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${customerToken}`
            },
            body: JSON.stringify({ service_id: serviceId, booking_date: '2025-01-01' })
        });

        // Check Seller Bookings
        console.log('Checking Seller Bookings...');
        res = await fetch('http://localhost:5000/api/bookings/seller-bookings', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sellerToken}`
            }
        });
        const bookings = await res.json();
        console.log('Seller Bookings:', bookings);

        if (bookings.length > 0 && bookings[0].service_id === serviceId) {
            console.log('SUCCESS: Seller sees the booking.');
        } else {
            console.log('FAILURE: Seller does not see the booking.');
        }

    } catch (error) {
        console.error('Test Error:', error);
    }
}

testSellerBookings();

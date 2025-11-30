const fetch = require('node-fetch');

async function testBookingStatus() {
    try {
        // 1. Login as seller (use the user from previous test or create new)
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
        res = await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${customerToken}`
            },
            body: JSON.stringify({ service_id: serviceId, booking_date: '2025-01-01' })
        });
        data = await res.json();
        const bookingId = data.bookingId;
        console.log('Booking Created ID:', bookingId);

        // Update Status to Accepted
        console.log('Accepting Booking...');
        res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sellerToken}`
            },
            body: JSON.stringify({ status: 'accepted' })
        });
        data = await res.json();
        console.log('Update Response:', data);

        // Verify Status
        console.log('Verifying Status...');
        res = await fetch('http://localhost:5000/api/bookings/seller-bookings', {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${sellerToken}`
            }
        });
        const bookings = await res.json();
        const booking = bookings.find(b => b.id === bookingId);
        if (booking && booking.status === 'accepted') {
            console.log('SUCCESS: Booking status updated to accepted.');
        } else {
            console.log('FAILURE: Booking status mismatch.', booking);
        }

    } catch (error) {
        console.error('Test Error:', error);
    }
}

testBookingStatus();

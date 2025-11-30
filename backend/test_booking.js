const fetch = require('node-fetch');

async function testBooking() {
    try {
        // 1. Login to get token
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test1764362849186@example.com', password: 'password123' }) // Use a known user or register a new one
        });

        // If login fails, register a new user
        let token;
        if (loginRes.status !== 200) {
            console.log('Login failed, registering new user...');
            const email = `booker${Date.now()}@example.com`;
            const regRes = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'booker', email, password: 'password123', role: 'customer' })
            });
            const regData = await regRes.json();
            token = (await (await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: 'password123' })
            })).json()).token;
        } else {
            const loginData = await loginRes.json();
            token = loginData.token;
        }

        console.log('Token obtained.');

        // 2. Get a service ID
        const servicesRes = await fetch('http://localhost:5000/api/services');
        const services = await servicesRes.json();
        if (services.length === 0) {
            console.log('No services found to book.');
            return;
        }
        const serviceId = services[0].id;
        console.log('Booking service ID:', serviceId);

        // 3. Create Booking
        const bookRes = await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ service_id: serviceId, booking_date: '2025-12-25' })
        });
        console.log('Booking Status:', bookRes.status);
        console.log('Booking Response:', await bookRes.json());

    } catch (error) {
        console.error('Test Error:', error);
    }
}

testBooking();

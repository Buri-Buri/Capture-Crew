const fetch = require('node-fetch');
const FormData = require('form-data');

async function testNotificationIntegration() {
    console.log('Testing Notification Integration via API...');
    const baseUrl = 'http://localhost:5000/api';

    try {
        const timestamp = Date.now();
        const sellerEmail = `seller${timestamp}@test.com`;
        const customerEmail = `customer${timestamp}@test.com`;

        // 1. Register & Login Seller
        console.log(`Step 1: Registering Seller (${sellerEmail})...`);
        await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: `seller${timestamp}`, email: sellerEmail, password: 'password123', role: 'seller' })
        });
        const sellerLoginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: sellerEmail, password: 'password123' })
        });
        const sellerData = await sellerLoginRes.json();
        const sellerToken = sellerData.token;
        if (!sellerToken) throw new Error('Seller login failed');
        console.log('✅ Seller Logged In');

        // 2. Create Service
        console.log('Step 2: Creating Service...');
        const form = new FormData();
        form.append('title', 'Notif Test Service ' + timestamp);
        form.append('description', 'Test Description');
        form.append('price', '100');
        form.append('category', 'Photography');

        const serviceRes = await fetch(`${baseUrl}/services`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sellerToken}`,
                ...form.getHeaders()
            },
            body: form
        });
        const serviceData = await serviceRes.json();
        const serviceId = serviceData.serviceId;
        if (!serviceId) throw new Error('Service creation failed');
        console.log(`✅ Service Created: ID ${serviceId}`);

        // 3. Register & Login Customer
        console.log(`Step 3: Registering Customer (${customerEmail})...`);
        await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: `customer${timestamp}`, email: customerEmail, password: 'password123', role: 'customer' })
        });
        const customerLoginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: customerEmail, password: 'password123' })
        });
        const customerData = await customerLoginRes.json();
        const customerToken = customerData.token;
        if (!customerToken) throw new Error('Customer login failed');
        console.log('✅ Customer Logged In');

        // 4. Customer Books Service
        console.log('Step 4: Customer Booking Service...');
        const bookingRes = await fetch(`${baseUrl}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${customerToken}`
            },
            body: JSON.stringify({ service_id: serviceId, booking_date: '2025-12-25', contact_info: '123', location: 'Test Loc' })
        });
        const bookingData = await bookingRes.json();
        const bookingId = bookingData.bookingId;
        if (!bookingId) {
            console.error('Booking failed:', bookingData);
            throw new Error('Booking failed');
        }
        console.log(`✅ Booking Created: ID ${bookingId}`);

        // 5. Verify Seller Notification
        console.log('Step 5: Verifying Seller has Notification...');
        // Wait a moment for async DB operations (if any)
        await new Promise(r => setTimeout(r, 1000));

        const sellerNotifRes = await fetch(`${baseUrl}/notifications`, {
            headers: { 'Authorization': `Bearer ${sellerToken}` }
        });
        const sellerNotifs = await sellerNotifRes.json();

        const bookingNotif = sellerNotifs.find(n => n.type === 'booking_request' && n.content.includes(serviceData.title || 'Notif Test Service'));

        if (bookingNotif) {
            console.log('✅ SUCCESS: Seller received booking notification:', bookingNotif);
        } else {
            console.error('❌ FAILURE: Seller did NOT receive booking notification. Notifications:', sellerNotifs);
        }

        // 6. Seller Accepts Booking
        console.log('Step 6: Seller Accepting Booking...');
        const acceptRes = await fetch(`${baseUrl}/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sellerToken}`
            },
            body: JSON.stringify({ status: 'accepted' })
        });
        const acceptData = await acceptRes.json();
        if (acceptData.message !== 'Booking status updated') {
            console.error('Accept failed:', acceptData);
        } else {
            console.log('✅ Booking Accepted');
        }

        // 7. Verify Customer Notification
        console.log('Step 7: Verifying Customer has Notification...');
        await new Promise(r => setTimeout(r, 1000));

        const customerNotifRes = await fetch(`${baseUrl}/notifications`, {
            headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        const customerNotifs = await customerNotifRes.json();

        const updateNotif = customerNotifs.find(n => n.type === 'booking_update' && n.content.includes('accepted'));

        if (updateNotif) {
            console.log('✅ SUCCESS: Customer received booking update notification:', updateNotif);
        } else {
            console.error('❌ FAILURE: Customer did NOT receive booking update notification. Notifications:', customerNotifs);
        }

    } catch (error) {
        console.error('❌ Integration Test Failed:', error);
    }
}

testNotificationIntegration();

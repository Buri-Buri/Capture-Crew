const fetch = require('node-fetch');
const fs = require('fs');

function log(msg) {
    console.log(msg);
    fs.appendFileSync('verification_result.txt', msg + '\n');
}

async function verifyChat() {
    fs.writeFileSync('verification_result.txt', ''); // Clear file
    const baseUrl = 'http://localhost:5000/api';
    log('Starting Backend Verification for Chat & Notifications...');

    try {
        // 1. Setup Data
        const sellerEmail = 'rahim@example.com';
        const sellerPassword = 'password123';
        const customerEmail = 'verify_chat_' + Date.now() + '@example.com';
        const customerPassword = 'password123';

        // 2. Login Seller
        log('Logging in Seller...');
        let res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: sellerEmail, password: sellerPassword })
        });
        if (!res.ok) throw new Error(`Seller login failed: ${res.statusText}`);
        const sellerData = await res.json();
        const sellerToken = sellerData.token;
        const sellerId = sellerData.user.id;
        log('Seller logged in.');

        // 3. Register Customer
        log(`Registering Customer: ${customerEmail}`);
        res = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: customerEmail, password: customerPassword, username: 'VerifyUser', role: 'customer' })
        });

        if (!res.ok) {
            const errBody = await res.text();
            log('Register result: ' + res.status + ' ' + errBody);
        } else {
            log('Registration successful.');
        }

        // 4. Always Login to get Token
        log('Logging in Customer...');
        res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: customerEmail, password: customerPassword })
        });
        if (!res.ok) throw new Error('Customer login failed: ' + await res.text());

        const customerData = await res.json();
        const customerToken = customerData.token;
        const customerId = customerData.user.id;
        log('Customer logged in.');

        // 5. Get a Service from Seller
        log('Fetching Seller Services...');
        res = await fetch(`${baseUrl}/services?seller_id=${sellerId}`);
        const services = await res.json();
        const service = services.find(s => s.seller_id === sellerId);
        if (!service) throw new Error('No service found for seller');
        log(`Using Service: ${service.title} (ID: ${service.id})`);

        // 6. Create Booking
        log('Creating Booking...');
        const bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() + 5);
        res = await fetch(`${baseUrl}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${customerToken}`
            },
            body: JSON.stringify({
                service_id: service.id,
                booking_date: bookingDate.toISOString(),
                contact_info: '01700000000',
                location: 'Dhaka Test Location',
                status: 'pending'
            })
        });
        if (!res.ok) throw new Error(`Booking failed: ${await res.text()}`);
        const booking = await res.json();
        const bookingId = booking.bookingId; // Corrected field

        if (!bookingId) {
            throw new Error('Booking ID missing in response: ' + JSON.stringify(booking));
        }

        log(`Booking Created: ID ${bookingId}`);

        // 7. Send Message with booking_id (Customer -> Seller)
        log('Sending Message with booking_id...');
        res = await fetch(`${baseUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${customerToken}`
            },
            body: JSON.stringify({
                receiver_id: sellerId,
                content: 'Hello regarding booking ' + bookingId,
                booking_id: bookingId
            })
        });
        if (!res.ok) throw new Error(`Send Message failed: ${await res.text()}`);
        log('Message sent.');

        // 8. Verify Seller Conversations (Check Grouping and Title)
        log('Verifying Seller Conversations...');
        res = await fetch(`${baseUrl}/messages/conversations`, {
            headers: { 'Authorization': `Bearer ${sellerToken}` }
        });
        const conversations = await res.json();
        const conv = conversations.find(c => c.booking_id === bookingId);

        if (!conv) {
            // Debug: print all conversation booking_ids
            log('All Conversations Booking IDs: ' + conversations.map(c => c.booking_id).join(', '));
            throw new Error('Conversation not found for this booking ID');
        }

        log('PASSED: Conversation grouped by booking_id found.');
        if (conv.booking_title === service.title) {
            log(`PASSED: Booking Title matches: "${conv.booking_title}"`);
        } else {
            log(`FAILED: Booking Title mismatch. Expected "${service.title}", Got "${conv.booking_title}"`);
        }

        // 9. Verify Seller Notifications (Check content)
        log('Verifying Seller Notifications...');
        res = await fetch(`${baseUrl}/notifications`, {
            headers: { 'Authorization': `Bearer ${sellerToken}` }
        });
        const notifications = await res.json();
        const notif = notifications.find(n => n.content.includes('VerifyUser') && n.type === 'message');

        if (notif) {
            log(`PASSED: Notification found with content: "${notif.content}"`);
        } else {
            log('FAILED: Notification with username not found. Recent: ' + JSON.stringify(notifications.slice(0, 3)));
        }

    } catch (err) {
        log('Verification Failed: ' + err.message);
        console.error(err);
        fs.appendFileSync('verification_result.txt', err.stack);
    }
}

verifyChat();

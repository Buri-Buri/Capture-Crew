const supabase = require('./config/supabase');
const { createBooking, getUserBookings } = require('./controllers/bookingController');
const { sendMessage, getConversations } = require('./controllers/messageController');
const User = require('./models/userModel');

// Mock Request and Response
const mockReq = (body, user) => ({
    body,
    user,
    params: {}
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function testMigration() {
    console.log('Starting Migration Test...');

    try {
        // 1. Ensure users exist
        let customerId, sellerId;

        // Check/Create Customer
        const { data: customer } = await supabase.from('users').select('id').eq('email', 'test1@example.com').single();
        if (customer) {
            customerId = customer.id;
        } else {
            customerId = await User.create({ username: 'testuser1', email: 'test1@example.com', password: 'password', role: 'customer' });
        }

        // Check/Create Seller
        const { data: seller } = await supabase.from('users').select('id').eq('email', 'test2@example.com').single();
        if (seller) {
            sellerId = seller.id;
        } else {
            sellerId = await User.create({ username: 'testuser2', email: 'test2@example.com', password: 'password', role: 'seller' });
        }

        console.log(`Testing with Customer: ${customerId}, Seller: ${sellerId}`);

        // 2. Create a dummy service for the seller if not exists
        const { data: service, error: serviceError } = await supabase
            .from('services')
            .insert([{
                seller_id: sellerId,
                title: 'Test Service',
                description: 'Test Description',
                price: 100,
                category: 'Test'
            }])
            .select()
            .single();

        let serviceId;
        if (serviceError) {
            console.error('Error creating service (might exist):', serviceError.message);
            // Try to fetch existing service
            const { data: existingService } = await supabase.from('services').select('id').eq('seller_id', sellerId).limit(1).single();
            if (existingService) {
                console.log('Using existing service:', existingService.id);
                serviceId = existingService.id;
            } else {
                return;
            }
        } else {
            console.log('Created Service:', service.id);
            serviceId = service.id;
        }

        // 3. Test Booking Creation
        const bookingReq = mockReq({
            service_id: serviceId,
            booking_date: '2025-01-01',
            contact_info: 'test@test.com',
            location: 'Test Location'
        }, { id: customerId });
        const bookingRes = mockRes();

        await createBooking(bookingReq, bookingRes);
        console.log('Create Booking Response:', bookingRes.statusCode, bookingRes.data);

        if (bookingRes.statusCode === 201) {
            const bookingId = bookingRes.data.bookingId;

            // 4. Test Get User Bookings
            const getBookingReq = mockReq({}, { id: customerId });
            const getBookingRes = mockRes();
            await getUserBookings(getBookingReq, getBookingRes);
            console.log('Get User Bookings:', getBookingRes.data.length > 0 ? 'Success' : 'Empty');
        }

        // 5. Test Sending Message
        const msgReq = mockReq({
            receiver_id: sellerId,
            content: 'Hello from migration test',
            booking_id: null
        }, { id: customerId });
        const msgRes = mockRes();

        await sendMessage(msgReq, msgRes);
        console.log('Send Message Response:', msgRes.statusCode, msgRes.data);

        // 6. Test Get Conversations
        const convReq = mockReq({}, { id: customerId });
        const convRes = mockRes();
        await getConversations(convReq, convRes);
        console.log('Get Conversations:', convRes.data.length > 0 ? 'Success' : 'Empty');
        if (convRes.data.length > 0) {
            console.log('First Conversation:', convRes.data[0]);
        }

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testMigration();

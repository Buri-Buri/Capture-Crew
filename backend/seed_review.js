const supabase = require('./config/supabase');

const seedReview = async () => {
    try {
        console.log('--- Seeding Review ---');

        // 1. Get a seller and a service
        const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('*')
            .limit(1)
            .single();

        if (serviceError) throw serviceError;
        console.log('Service:', service.title);

        // 2. Get a customer (use test user or create one)
        const { data: customers, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'customer')
            .limit(1);

        if (userError) throw userError;
        let customer = customers[0];

        if (!customer) {
            console.log('No customer found, cannot seed review without creating booking first.');
            return;
        }

        console.log('Customer:', customer.email);

        // 3. Create a COMPLETED booking
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert([{
                customer_id: customer.id,
                service_id: service.id,
                booking_date: new Date().toISOString(),
                contact_info: 'test@example.com',
                location: 'Dhaka',
                status: 'completed',
                is_completed: true
            }])
            .select()
            .single();

        if (bookingError) throw bookingError;
        console.log('Created Booking:', booking.id);

        // 4. Create a Review
        const { data: review, error: reviewError } = await supabase
            .from('reviews')
            .insert([{
                booking_id: booking.id,
                rating: 5,
                comment: 'This is a seeded test review.'
            }])
            .select()
            .single();

        if (reviewError) throw reviewError;
        console.log('Created Review:', review.id);

    } catch (error) {
        console.error('Error:', error);
    }
};

seedReview();

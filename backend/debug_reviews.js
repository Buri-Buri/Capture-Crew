const supabase = require('./config/supabase');

const debugReviews = async () => {
    try {
        console.log('--- Debugging Reviews ---');

        // 1. List all reviews
        const { data: allReviews, error: reviewError } = await supabase
            .from('reviews')
            .select('*');
        if (reviewError) console.error('Error fetching reviews:', reviewError);
        console.log('Total Reviews in DB:', allReviews?.length);
        console.log('Sample Review:', allReviews?.[0]);

        if (allReviews?.length > 0) {
            const sampleBookingId = allReviews[0].booking_id;

            // 2. Check the booking for this review
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .select('*, services(id, title)')
                .eq('id', sampleBookingId)
                .single();

            if (bookingError) console.error('Error fetching booking:', bookingError);
            console.log('Booking for review:', booking);

            if (booking) {
                // 3. Try the exact query from the controller
                const serviceId = booking.service_id;
                console.log(`Testing fetching reviews for Service ID: ${serviceId}`);

                // Fetch bookings for service
                const { data: serviceBookings } = await supabase
                    .from('bookings')
                    .select('id')
                    .eq('service_id', serviceId);

                const bookingIds = serviceBookings.map(b => b.id);
                console.log('Booking IDs for service:', bookingIds);

                // Fetch reviews with join
                const { data: reviewsWithJoin, error: joinError } = await supabase
                    .from('reviews')
                    .select(`
                        *,
                        bookings (
                            customer_id,
                            users (username, profile_picture)
                        )
                    `)
                    .in('booking_id', bookingIds);

                if (joinError) {
                    console.error('Join Query Error:', joinError);
                    // Try simpler join to isolate issue
                    console.log('Retrying with simpler join...');
                    const { data: simpleJoin, error: simpleError } = await supabase
                        .from('reviews')
                        .select('*, bookings(*)')
                        .in('booking_id', bookingIds);
                    if (simpleError) console.error('Simple Join Error:', simpleError);
                    else console.log('Simple Join Result:', simpleJoin);
                } else {
                    console.log('Join Query Result:', JSON.stringify(reviewsWithJoin, null, 2));
                }
            }
        } else {
            console.log('No reviews found to debug. Please add a review first.');
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
};

debugReviews();

const supabase = require('./config/supabase');

const checkReviews = async () => {
    try {
        const serviceId = 9;
        console.log(`Checking reviews for Service ID: ${serviceId}`);

        // 1. Check if service exists
        const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('id, title, seller_id')
            .eq('id', serviceId)
            .single();

        if (serviceError) {
            console.log('Service check error:', serviceError.message);
        } else {
            console.log('Service found:', service);
        }

        // 2. Get bookings for this service
        const { data: bookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('service_id', serviceId);

        const bookingIds = bookings?.map(b => b.id) || [];
        console.log(`Found ${bookingIds.length} bookings for this service:`, bookingIds);

        if (bookingIds.length > 0) {
            // 3. Get reviews for these bookings
            const { data: reviews, error: reviewsError } = await supabase
                .from('reviews')
                .select('*')
                .in('booking_id', bookingIds);

            if (reviewsError) {
                console.error('Error fetching reviews:', reviewsError);
            } else {
                console.log(`Found ${reviews.length} reviews for Service ID ${serviceId}:`, reviews);
            }
        } else {
            console.log('No bookings, so definitely no reviews.');
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
};

checkReviews();

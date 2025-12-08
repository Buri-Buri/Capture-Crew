const supabase = require('./config/supabase');

const findServiceWithReviews = async () => {
    try {
        // Find a review
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('booking_id')
            .limit(5);

        if (reviews && reviews.length > 0) {
            console.log(`Found ${reviews.length} reviews. Checking associated services...`);

            for (let review of reviews) {
                const { data: booking } = await supabase
                    .from('bookings')
                    .select('service_id, services(title)')
                    .eq('id', review.booking_id)
                    .single();

                if (booking) {
                    console.log(`Service ID ${booking.service_id} ("${booking.services?.title}") has reviews.`);
                }
            }
        } else {
            console.log('No reviews found in the entire database.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

findServiceWithReviews();

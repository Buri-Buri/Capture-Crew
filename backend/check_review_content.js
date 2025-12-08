const supabase = require('./config/supabase');

const checkReviewContent = async () => {
    try {
        console.log('Searching for review with content "great"...');

        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .ilike('comment', '%great%'); // Case insensitive search

        if (error) throw error;

        if (reviews && reviews.length > 0) {
            console.log('Found reviews:', reviews);
            // Also check the service details for these reviews
            for (let review of reviews) {
                const { data: booking } = await supabase
                    .from('bookings')
                    .select('service_id, services(title)')
                    .eq('id', review.booking_id)
                    .single();
                console.log(`Review ${review.id} belongs to Service ID: ${booking?.service_id} (${booking?.services?.title})`);
            }
        } else {
            console.log('No review found with comment "great".');
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

checkReviewContent();

const supabase = require('../config/supabase');

const addReview = async (req, res) => {
    const { bookingId, rating, comment } = req.body;
    const userId = req.user.id;

    try {
        // 1. Verify the booking exists and belongs to the user
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .eq('customer_id', userId)
            .single();

        if (bookingError || !booking) {
            return res.status(404).json({ message: 'Booking not found or unauthorized' });
        }

        // 2. Verify the booking is completed
        if (!booking.is_completed) {
            return res.status(400).json({ message: 'Cannot review an incomplete booking' });
        }

        // 3. Check if a review already exists for this booking
        const { data: existingReview, error: reviewCheckError } = await supabase
            .from('reviews')
            .select('*')
            .eq('booking_id', bookingId)
            .single();

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this booking' });
        }

        // 4. Insert the review
        const { data: review, error: insertError } = await supabase
            .from('reviews')
            .insert([
                { booking_id: bookingId, rating, comment }
            ])
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        res.status(201).json({ message: 'Review added successfully', review });

    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getServiceReviews = async (req, res) => {
    const { serviceId } = req.params;

    try {
        // Get all bookings for this service
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('id')
            .eq('service_id', serviceId);

        if (bookingsError) throw bookingsError;

        const bookingIds = bookings.map(b => b.id);

        if (bookingIds.length === 0) {
            return res.json([]);
        }

        // Get reviews for these bookings
        const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select(`
                *,
                bookings (
                    customer_id,
                    users:customer_id (username, profile_picture)
                )
            `)
            .in('booking_id', bookingIds)
            .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;

        // Format the response to make it easier for frontend
        const formattedReviews = reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            created_at: review.created_at,
            user: review.bookings?.users || { username: 'Anonymous' }
        }));

        res.json(formattedReviews);

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addReview,
    getServiceReviews
};

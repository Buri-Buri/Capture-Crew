const supabase = require('../config/supabase');

const createBooking = async (req, res) => {
    try {
        const { service_id, booking_date, contact_info, location } = req.body;
        const customer_id = req.user.id;

        if (!service_id || !booking_date || !contact_info || !location) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (req.user.role === 'seller') {
            return res.status(403).json({ message: 'Sellers cannot book services' });
        }

        const { data, error } = await supabase
            .from('bookings')
            .insert([
                { customer_id, service_id, booking_date, contact_info, location, status: 'pending' }
            ])
            .select()
            .single();

        if (error) throw error;

        // Notify seller
        // First get service details to know the seller (already have it? No, need to fetch or trust input? 
        // Wait, createBooking takes service_id. We need to find the seller_id from service_id.
        // The original code didn't fetch seller_id explicitly to return it, but we need it for notification.

        const { data: serviceData } = await supabase
            .from('services')
            .select('seller_id, title')
            .eq('id', service_id)
            .single();

        if (serviceData) {
            await supabase
                .from('notifications')
                .insert([
                    {
                        user_id: serviceData.seller_id,
                        type: 'booking_request',
                        content: `New booking request for ${serviceData.title}`,
                        related_id: data.id,
                        is_read: false
                    }
                ]);
        }

        res.status(201).json({ message: 'Booking created successfully', bookingId: data.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const customer_id = req.user.id;

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                services (
                    title,
                    price,
                    image_url,
                    seller_id,
                    users (
                        username
                    )
                )
            `)
            .eq('customer_id', customer_id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match previous structure if needed
        const formattedBookings = data.map(booking => ({
            ...booking,
            service_title: booking.services?.title,
            total_price: booking.services?.price,
            image_url: booking.services?.image_url,
            seller_name: booking.services?.users?.username,
            seller_id: booking.services?.seller_id
        }));

        res.json(formattedBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSellerBookings = async (req, res) => {
    try {
        const seller_id = req.user.id;

        // We need to filter bookings where the service belongs to the seller
        // Supabase allows filtering on joined tables
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                services!inner (
                    title,
                    price,
                    seller_id
                ),
                users (
                    username
                )
            `)
            .eq('services.seller_id', seller_id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedBookings = data.map(booking => ({
            ...booking,
            service_title: booking.services?.title,
            service_price: booking.services?.price,
            customer_name: booking.users?.username
        }));

        res.json(formattedBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const seller_id = req.user.id;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Verify ownership
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
                id,
                services!inner (
                    seller_id
                )
            `)
            .eq('id', id)
            .eq('services.seller_id', seller_id)
            .single();

        if (fetchError || !booking) {
            return res.status(404).json({ message: 'Booking not found or unauthorized' });
        }

        const { data: updatedBooking, error: updateError } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        // Notify customer
        // booking object has services!inner(seller_id), but we need customer_id.
        // We should fetch customer_id from the booking we just updated or the one we fetched.
        // The initial fetch didn't select customer_id. Let's update the select.

        // Re-fetch or use the updatedBooking if it returns customer_id. 
        // The update returns 'select()', so it should return all fields including customer_id.

        if (updatedBooking) {
            await supabase
                .from('notifications')
                .insert([
                    {
                        user_id: updatedBooking.customer_id,
                        type: 'booking_update',
                        content: `Your booking status has been updated to ${status}`,
                        related_id: updatedBooking.id,
                        is_read: false
                    }
                ]);
        }

        res.json({ message: 'Booking status updated', booking: updatedBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        const seller_id = req.user.id;

        if (!['pending', 'paid'].includes(payment_status)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        // Verify ownership
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
                id,
                services!inner (
                    seller_id
                )
            `)
            .eq('id', id)
            .eq('services.seller_id', seller_id)
            .single();

        if (fetchError || !booking) {
            return res.status(404).json({ message: 'Booking not found or unauthorized' });
        }

        const { data: updatedBooking, error: updateError } = await supabase
            .from('bookings')
            .update({ payment_status })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({ message: 'Payment status updated', booking: updatedBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const completeBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const seller_id = req.user.id;

        // Verify ownership
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
                id,
                services!inner (
                    seller_id
                )
            `)
            .eq('id', id)
            .eq('services.seller_id', seller_id)
            .single();

        if (fetchError || !booking) {
            return res.status(404).json({ message: 'Booking not found or unauthorized' });
        }

        const { data: updatedBooking, error: updateError } = await supabase
            .from('bookings')
            .update({ is_completed: true, status: 'completed' })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        // Notify customer
        if (updatedBooking) {
            await supabase
                .from('notifications')
                .insert([
                    {
                        user_id: updatedBooking.customer_id,
                        type: 'booking_update',
                        content: `Your booking has been marked as completed`,
                        related_id: updatedBooking.id,
                        is_read: false
                    }
                ]);
        }

        res.json({ message: 'Booking marked as completed', booking: updatedBooking });
    } catch (error) {
        console.error(error);
        const fs = require('fs');
        fs.appendFileSync('debug_error.txt', JSON.stringify(error) + '\n');
        res.status(500).json({ message: 'Server error: ' + error.message, details: error });
    }
};

module.exports = { createBooking, getUserBookings, getSellerBookings, updateBookingStatus, updatePaymentStatus, completeBooking };

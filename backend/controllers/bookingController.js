const db = require('../config/db');

const createBooking = async (req, res) => {
    try {
        const { service_id, booking_date, contact_info, location } = req.body;
        const customer_id = req.user.id;

        if (!service_id || !booking_date || !contact_info || !location) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [result] = await db.query(
            'INSERT INTO bookings (customer_id, service_id, booking_date, contact_info, location, status) VALUES (?, ?, ?, ?, ?, ?)',
            [customer_id, service_id, booking_date, contact_info, location, 'pending']
        );

        res.status(201).json({ message: 'Booking created successfully', bookingId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const [rows] = await db.query(
            `SELECT bookings.*, services.title as service_title, services.image_url, users.username as seller_name 
             FROM bookings 
             JOIN services ON bookings.service_id = services.id 
             JOIN users ON services.seller_id = users.id 
             WHERE bookings.customer_id = ? 
             ORDER BY bookings.created_at DESC`,
            [customer_id]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSellerBookings = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const [rows] = await db.query(
            `SELECT bookings.*, services.title as service_title, users.username as customer_name 
             FROM bookings 
             JOIN services ON bookings.service_id = services.id 
             JOIN users ON bookings.customer_id = users.id 
             WHERE services.seller_id = ? 
             ORDER BY bookings.created_at DESC`,
            [seller_id]
        );
        res.json(rows);
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

        const [booking] = await db.query(
            `SELECT bookings.* FROM bookings 
             JOIN services ON bookings.service_id = services.id 
             WHERE bookings.id = ? AND services.seller_id = ?`,
            [id, seller_id]
        );

        if (booking.length === 0) {
            return res.status(404).json({ message: 'Booking not found or unauthorized' });
        }

        await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Booking status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createBooking, getUserBookings, getSellerBookings, updateBookingStatus };

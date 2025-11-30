const express = require('express');
const { createBooking, getUserBookings, getSellerBookings, updateBookingStatus } = require('../controllers/bookingController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/migrate-profile-pic', async (req, res) => {
    const db = require('../config/db');
    try {
        await db.query(`ALTER TABLE users ADD COLUMN profile_picture TEXT`);
        res.send('Migration success');
    } catch (error) {
        console.error('Migration Error:', error);
        res.status(500).send('Migration failed: ' + error.message);
    }
});
router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getUserBookings);
router.get('/seller-bookings', verifyToken, getSellerBookings);
router.put('/:id/status', verifyToken, updateBookingStatus);

module.exports = router;

const express = require('express');
const { addReview, getServiceReviews } = require('../controllers/reviewController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, addReview);
router.get('/service/:serviceId', getServiceReviews);

module.exports = router;

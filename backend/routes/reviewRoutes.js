const express = require('express');
const { addReview, getServiceReviews } = require('../controllers/reviewController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();
const fs = require('fs');

router.use((req, res, next) => {
    fs.appendFileSync('server_debug.log', `ReviewRouter: Hit ${req.method} ${req.url}\n`);
    next();
});

router.post('/', verifyToken, addReview);
router.get('/service/:serviceId', getServiceReviews);

module.exports = router;

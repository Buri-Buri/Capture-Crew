const express = require('express');
const { createService, getMyServices, getAllServices } = require('../controllers/serviceController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getAllServices);
router.post('/', verifyToken, upload.array('images', 10), createService);
router.get('/my-services', verifyToken, getMyServices);

module.exports = router;

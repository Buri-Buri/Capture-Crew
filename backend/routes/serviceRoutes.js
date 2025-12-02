const express = require('express');
const { createService, getMyServices, getAllServices, deleteServiceImage, updateService, deleteService } = require('../controllers/serviceController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getAllServices);
router.post('/', verifyToken, upload.array('images', 10), createService);
router.get('/my-services', verifyToken, getMyServices);
router.delete('/:serviceId/images', verifyToken, deleteServiceImage);
router.put('/:id', verifyToken, upload.array('images', 10), updateService);
router.delete('/:id', verifyToken, deleteService);

module.exports = router;

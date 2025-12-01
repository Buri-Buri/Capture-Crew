const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/profile-picture', verifyToken, upload.single('profile_picture'), userController.uploadProfilePicture);
router.get('/profile', verifyToken, userController.getUserProfile);
router.put('/profile', verifyToken, upload.single('profile_picture'), userController.updateUserProfile);

module.exports = router;

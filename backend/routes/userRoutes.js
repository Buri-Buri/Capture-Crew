const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/profile-picture', verifyToken, upload.single('profile_picture'), userController.uploadProfilePicture);
router.get('/profile', verifyToken, userController.getUserProfile);
router.put('/profile', verifyToken, (req, res, next) => {
    upload.single('profile_picture')(req, res, (err) => {
        if (err) {
            console.error('Multer Upload Error:', err);
            return res.status(400).json({ message: 'File upload failed', error: err.message });
        }
        next();
    });
}, userController.updateUserProfile);

module.exports = router;

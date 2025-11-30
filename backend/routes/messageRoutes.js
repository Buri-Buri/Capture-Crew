const express = require('express');
const { sendMessage, getConversations, getMessages } = require('../controllers/messageController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyToken); // All routes require authentication

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/:userId', getMessages);

module.exports = router;

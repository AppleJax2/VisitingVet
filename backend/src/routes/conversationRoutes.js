const express = require('express');
const {
    getConversations,
    getMessagesForConversation,
    startConversation
} = require('../controllers/conversationController');

const { protect, authorize } = require('../middleware/authMiddleware'); // Adjust path if needed

const router = express.Router();

// Apply authentication middleware to all conversation routes
router.use(protect);

router.route('/')
    .get(getConversations);

router.route('/start')
    .post(startConversation);

router.route('/:conversationId/messages')
    .get(getMessagesForConversation);

module.exports = router; 
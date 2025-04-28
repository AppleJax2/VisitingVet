const express = require('express');
const {
    createVideoToken
} = require('../controllers/videoController');

const { protect } = require('../middleware/authMiddleware'); // Assuming authentication is needed

const router = express.Router();

// All video routes should be protected
router.use(protect);

// Route to get a meeting token for a specific room (or create room if needed)
router.route('/token').post(createVideoToken);

module.exports = router; 
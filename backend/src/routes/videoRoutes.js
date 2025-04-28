const express = require('express');
const {
    createVideoToken,
    getRecordingsForRoom,
    getRecordingAccessLink
} = require('../controllers/videoController');

const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming authentication is needed

const router = express.Router();

// All video routes should be protected
router.use(protect);

// Route to get a meeting token for a specific room (or create room if needed)
router.route('/token').post(createVideoToken);

// Route to get recordings for a room (appointment ID)
// Note: roomName likely corresponds to appointmentId
router.route('/recordings/:roomName').get(getRecordingsForRoom);

// Route to get a temporary access link for a specific recording ID
router.route('/recordings/link/:recordingId').get(getRecordingAccessLink);

module.exports = router; 
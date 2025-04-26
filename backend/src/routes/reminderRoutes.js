const express = require('express');
const {
  createReminder,
  getUserReminders,
  updateReminder,
  deleteReminder
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware'); // Assuming generic protect middleware

const router = express.Router();

// Apply authentication middleware to all reminder routes
router.use(protect);

router.route('/')
  .post(createReminder) // Any authenticated user can create reminders
  .get(getUserReminders); // Any authenticated user can get their own reminders

router.route('/:id')
  .put(updateReminder) // Users can update their own reminders (controller handles auth)
  .delete(deleteReminder); // Users can delete their own reminders (controller handles auth)

module.exports = router; 
const Reminder = require('../models/Reminder');
const mongoose = require('mongoose');

// @desc    Create a reminder
// @route   POST /api/reminders
// @access  Private
exports.createReminder = async (req, res) => {
  const { title, description, dueDate, priority, petId, isComplete } = req.body;
  const userId = req.user._id;

  if (!title || !dueDate) {
    return res.status(400).json({ success: false, error: 'Title and due date are required' });
  }

  try {
    const reminderData = {
      user: userId,
      title,
      description,
      dueDate,
      priority,
      isComplete
    };

    if (petId && mongoose.Types.ObjectId.isValid(petId)) {
        // TODO: Optionally verify the pet belongs to the user
        reminderData.pet = petId;
    }

    const reminder = await Reminder.create(reminderData);
    res.status(201).json({ success: true, reminder });
  } catch (error) {
    console.error('Error creating reminder:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server error creating reminder' });
  }
};

// @desc    Get user's reminders
// @route   GET /api/reminders
// @access  Private
exports.getUserReminders = async (req, res) => {
  const userId = req.user._id;
  const { isComplete, petId } = req.query; // Allow filtering

  const query = { user: userId };
  if (isComplete !== undefined) {
      query.isComplete = isComplete === 'true';
  }
  if (petId && mongoose.Types.ObjectId.isValid(petId)) {
      query.pet = petId;
  }

  try {
    const reminders = await Reminder.find(query)
      .populate('pet', 'name species') // Optionally populate pet info
      .sort({ dueDate: 1 }); // Sort by due date
      
    res.status(200).json({ success: true, count: reminders.length, reminders });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ success: false, error: 'Server error fetching reminders' });
  }
};

// @desc    Update a reminder
// @route   PUT /api/reminders/:id
// @access  Private
exports.updateReminder = async (req, res) => {
  const reminderId = req.params.id;
  const userId = req.user._id;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(reminderId)) {
    return res.status(400).json({ success: false, error: 'Invalid reminder ID' });
  }

  try {
    const reminder = await Reminder.findById(reminderId);

    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }

    if (reminder.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this reminder' });
    }

    // Prevent user field from being updated
    delete updateData.user;
    
    // Handle pet ID update
    if (updateData.petId === '') {
        updateData.pet = null; // Allow unsetting the pet
        delete updateData.petId;
    } else if (updateData.petId && mongoose.Types.ObjectId.isValid(updateData.petId)) {
        // TODO: Optionally verify the pet belongs to the user
        updateData.pet = updateData.petId;
        delete updateData.petId;
    }

    const updatedReminder = await Reminder.findByIdAndUpdate(reminderId, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, reminder: updatedReminder });
  } catch (error) {
    console.error(`Error updating reminder ${reminderId}:`, error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server error updating reminder' });
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
exports.deleteReminder = async (req, res) => {
  const reminderId = req.params.id;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(reminderId)) {
    return res.status(400).json({ success: false, error: 'Invalid reminder ID' });
  }

  try {
    const reminder = await Reminder.findById(reminderId);

    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }

    if (reminder.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this reminder' });
    }

    await reminder.deleteOne();

    res.status(200).json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error(`Error deleting reminder ${reminderId}:`, error);
    res.status(500).json({ success: false, error: 'Server error deleting reminder' });
  }
}; 
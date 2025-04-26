const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  pet: { // Optional: Link reminder to a specific pet
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
  },
  title: {
    type: String,
    required: [true, 'Reminder title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  isComplete: {
    type: Boolean,
    default: false,
    index: true,
  },
  // Could add recurrence rules later (e.g., daily, weekly, monthly)
}, {
  timestamps: true
});

// Ensure due date is not in the past (on creation/update)
// reminderSchema.pre('save', function(next) {
//   if (this.isModified('dueDate') && this.dueDate < new Date()) {
//     // Allow reminders for past events if needed, otherwise uncomment:
//     // return next(new Error('Due date cannot be in the past')); 
//   }
//   next();
// });

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder; 
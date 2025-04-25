const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisitingVetProfile',
    required: true,
    unique: true, // One availability schedule per profile
  },
  weeklySchedule: [{
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0, // Sunday
      max: 6, // Saturday
    },
    startTime: {
      type: String,
      required: true,
      // Format: HH:MM (24-hour format)
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      // Format: HH:MM (24-hour format)
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    }
  }],
  // For future extension: special dates (holidays, vacations, etc.)
  specialDates: [{
    date: {
      type: Date,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: String,
      // Optional: If available on this date, what are the hours?
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    note: {
      type: String,
      maxlength: 200,
    }
  }],
}, { timestamps: true });

// Helper method to check if a specific datetime is available
availabilitySchema.methods.isTimeAvailable = function(date) {
  // This is a placeholder for future functionality
  // Will implement logic to check against weekly schedule and special dates
  return true;
};

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability; 
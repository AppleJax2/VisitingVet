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
  
  const requestDate = new Date(date);
  
  // Check if it's a special date first (holiday, vacation, etc)
  const specialDate = this.specialDates.find(special => {
    const specialDateTime = new Date(special.date);
    return (
      specialDateTime.getFullYear() === requestDate.getFullYear() &&
      specialDateTime.getMonth() === requestDate.getMonth() &&
      specialDateTime.getDate() === requestDate.getDate()
    );
  });
  
  // If it's a special date, check its availability
  if (specialDate) {
    if (!specialDate.isAvailable) {
      return false; // Provider marked this date as unavailable
    }
    
    // If special date has specific hours, check those
    if (specialDate.startTime && specialDate.endTime) {
      const requestTimeStr = `${requestDate.getHours().toString().padStart(2, '0')}:${requestDate.getMinutes().toString().padStart(2, '0')}`;
      return requestTimeStr >= specialDate.startTime && requestTimeStr <= specialDate.endTime;
    }
    
    // Otherwise special date is available all day
    return true;
  }
  
  // Check regular weekly schedule
  const dayOfWeek = requestDate.getDay(); // 0 for Sunday, 6 for Saturday
  const daySchedule = this.weeklySchedule.find(schedule => schedule.dayOfWeek === dayOfWeek);
  
  // If no schedule found for this day or marked as unavailable
  if (!daySchedule || !daySchedule.isAvailable) {
    return false;
  }
  
  // Check if the requested time is within available hours
  const requestTimeStr = `${requestDate.getHours().toString().padStart(2, '0')}:${requestDate.getMinutes().toString().padStart(2, '0')}`;
  return requestTimeStr >= daySchedule.startTime && requestTimeStr <= daySchedule.endTime;
};

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability; 
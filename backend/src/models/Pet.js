const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for faster queries by owner
  },
  name: {
    type: String,
    required: [true, 'Pet name is required'],
    trim: true,
    maxlength: [50, 'Pet name cannot exceed 50 characters']
  },
  species: {
    type: String,
    required: [true, 'Pet species is required'],
    trim: true,
    maxlength: [50, 'Species cannot exceed 50 characters']
    // Consider enum for common species if needed
  },
  breed: {
    type: String,
    required: [true, 'Pet breed is required'],
    trim: true,
    maxlength: [50, 'Breed cannot exceed 50 characters']
  },
  age: {
    type: Number,
    required: [true, 'Pet age is required'],
    min: [0, 'Age cannot be negative'],
    max: [50, 'Please enter a realistic age'] // Adjust max age as needed
  },
  // Optional fields - Add more as needed
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Unknown'],
    default: 'Unknown'
  },
  weight: {
    type: Number,
    min: 0
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'lbs'],
    default: 'lbs' 
  },
  profileImage: {
    type: String, // URL to the image
    default: '' // Placeholder or default image URL
  },
  microchipId: {
    type: String,
    trim: true,
    default: ''
  },
  medicalHistory: {
    type: String, // Could be more structured (e.g., array of objects)
    default: ''
  },
  lastCheckup: {
      type: Date,
  }
  // Add more fields like vaccination records, allergies, etc.
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Ensure a user cannot have two pets with the same name (optional, adjust as needed)
// petSchema.index({ owner: 1, name: 1 }, { unique: true });

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet; 
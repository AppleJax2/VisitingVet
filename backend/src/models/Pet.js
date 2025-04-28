const mongoose = require('mongoose');

// Define sub-schema for medical record entries
const medicalRecordEntrySchema = new mongoose.Schema({
    recordType: {
        type: String,
        required: true,
        enum: [ // Expand as needed
            'Vaccination',
            'Procedure',
            'Condition',
            'Allergy',
            'Observation', 
            'LabResult', 
            'Prescription', 
            'Note'
        ],
        index: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        index: true,
    },
    title: { // e.g., "Rabies Vaccination", "Annual Checkup Note"
        type: String,
        trim: true,
        required: [true, 'Please provide a title or summary for the record'],
        maxlength: [150, 'Title cannot exceed 150 characters']
    },
    details: { // Flexible field for different record types
        type: mongoose.Schema.Types.Mixed, // Store structured data (object) or plain text
        required: true
    },
    documentUrl: { // For uploaded files (lab results, etc.)
        type: String,
        trim: true,
    },
    enteredBy: { // User who created the record (Provider/Owner/Clinic)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    visibility: {
        type: String,
        enum: ['OwnerOnly', 'AllSharedProviders', 'SpecificProviders'], // Adjust as needed
        default: 'AllSharedProviders', // Default visibility for provider entries?
        required: true,
    },
    // sharedWith: [{ // Only relevant if visibility is SpecificProviders
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    // }],
}, { _id: true, timestamps: true }); // Ensure subdocuments get timestamps and _id

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
    // required: [true, 'Pet breed is required'], // Make optional?
    trim: true,
    maxlength: [50, 'Breed cannot exceed 50 characters']
  },
  dateOfBirth: {
    type: Date,
    // required: [true, 'Pet date of birth is required'],
  },
  // Removed 'age' field, calculate from dateOfBirth if needed
  sex: {
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
  // Detailed Medical Information
  allergies: {
    type: [String],
    default: [],
  },
  existingConditions: {
      type: [String], // Simple list of chronic conditions
      default: [],
  },
  // Removed simple medicalHistory string, replaced by structured records
  medicalRecords: [medicalRecordEntrySchema], // Array of structured records

  // --- Vaccination Specific Fields ---
  vaccinationHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VaccinationRecord'
  }],
  latestVerificationStatusSummary: {
      type: String,
      enum: ['Up-to-date', 'Needs Attention', 'Pending', 'Unknown'],
      default: 'Unknown',
      // This might be better handled by a virtual or service layer logic
  },
  hasPendingVerification: {
      type: Boolean,
      default: false,
      // This should be updated via service logic when records change status
  },
  // --- End Vaccination Specific Fields ---

  lastCheckup: {
      type: Date,
  }
  // Add more fields like vaccination records, allergies, etc.
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Optional: Add virtual for age calculation
petSchema.virtual('calculatedAge').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let ageYears = today.getFullYear() - birthDate.getFullYear();
  let ageMonths = today.getMonth() - birthDate.getMonth();
  if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birthDate.getDate())) {
    ageYears--;
    ageMonths += 12;
  }
  // Return a string like "3 years, 4 months" or just months if less than a year
  if (ageYears > 0) {
      return `${ageYears} year${ageYears > 1 ? 's' : ''}${ageMonths > 0 ? `, ${ageMonths} month${ageMonths > 1 ? 's' : ''}` : ''}`;
  } else if (ageMonths > 0) {
       return `${ageMonths} month${ageMonths > 1 ? 's' : ''}`;
  } else {
      // Calculate days if less than a month?
      const ageDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
      return `${ageDays} day${ageDays !== 1 ? 's' : ''}`;
  }
});

// Ensure virtual fields are included when converting to JSON/Object
petSchema.set('toJSON', { virtuals: true });
petSchema.set('toObject', { virtuals: true });

// Ensure a user cannot have two pets with the same name (optional, adjust as needed)
// petSchema.index({ owner: 1, name: 1 }, { unique: true });

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet; 
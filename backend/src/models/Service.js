const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisitingVetProfile',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true,
    maxlength: [100, 'Service name cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a service description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
  },
  estimatedDurationMinutes: {
    type: Number,
    required: [true, 'Please provide an estimated duration'],
    min: [1, 'Duration must be at least 1 minute'],
  },
  price: {
    type: Number,
    min: [0, 'Price must be a positive number'],
  },
  hasPublicPricing: {
    type: Boolean,
    default: true,
    required: true,
  },
  b2bPrice: {
    type: Number,
    min: [0, 'B2B price must be a positive number'],
  },
  b2cPrice: {
    type: Number,
    min: [0, 'B2C price must be a positive number'],
  },
  hasDifferentPricing: {
    type: Boolean,
    default: false,
  },
  priceType: {
    type: String,
    enum: ['Flat', 'Hourly', 'Range', 'Contact'],
    default: 'Flat',
  },
  offeredLocation: {
    type: String,
    enum: ['InHome', 'InClinic', 'Both', 'Farm', 'Ranch', 'Stable'],
    default: 'InHome',
  },
  animalType: {
    type: String,
    enum: ['Small Animal', 'Large Animal', 'Exotic', 'Avian', 'Equine', 'Farm Animal', 'Other'],
    required: [true, 'Please specify the animal type for this service'],
  },
  isSpecialtyService: {
    type: Boolean,
    default: false,
  },
  specialtyType: {
    type: String,
    trim: true,
  },
  customFields: [{
    name: String,
    description: String,
    required: Boolean,
    type: {
      type: String,
      enum: ['Text', 'Number', 'Boolean', 'Select'],
      default: 'Text'
    },
    options: [String],
  }],
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service; 
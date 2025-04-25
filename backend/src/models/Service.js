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
    required: [true, 'Please provide a price'],
    min: [0, 'Price must be a positive number'],
  },
  priceType: {
    type: String,
    enum: ['Flat', 'Hourly', 'Range'],
    default: 'Flat',
  },
  offeredLocation: {
    type: String,
    enum: ['InHome', 'InClinic', 'Both'],
    default: 'InHome',
  },
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service; 
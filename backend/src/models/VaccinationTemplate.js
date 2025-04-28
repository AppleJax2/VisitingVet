const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vaccinationTemplateSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Ensure template names are unique
  },
  description: {
    type: String,
    trim: true,
  },
  // Layout configuration could be complex. Using Mixed for flexibility, 
  // but a more structured schema might be better depending on the rendering engine.
  layoutConfiguration: {
    type: Schema.Types.Mixed, // e.g., { format: 'pdf', orientation: 'portrait', elements: [...] }
    required: true,
  },
  brandingOptions: {
    logoUrl: { type: String, trim: true },
    primaryColor: { type: String, trim: true },
    secondaryColor: { type: String, trim: true },
    // Add other branding fields as needed
  },
  requiredFields: [
    { // List of fields expected from VaccinationRecord for this template
      type: String, 
      trim: true 
    }
  ],
  isDefault: {
      type: Boolean,
      default: false, // Can mark one template as the default
  },
  createdBy: { // User who created the template (Admin)
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Index for finding templates by name
vaccinationTemplateSchema.index({ name: 1 });
// Index for finding the default template quickly
vaccinationTemplateSchema.index({ isDefault: 1 }); 

const VaccinationTemplate = mongoose.model('VaccinationTemplate', vaccinationTemplateSchema);

module.exports = VaccinationTemplate; 
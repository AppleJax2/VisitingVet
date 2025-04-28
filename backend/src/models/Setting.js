const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: [true, 'Setting key is required'],
        unique: true,
        trim: true,
        description: 'Unique identifier for the setting (e.g., platformFeePercentage, defaultSessionTimeout)'
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Setting value is required'],
        description: 'The value of the setting. Type depends on the setting itself.'
    },
    description: {
        type: String,
        trim: true,
        description: 'A brief description of what the setting controls.'
    },
    type: {
        type: String,
        enum: ['string', 'number', 'boolean', 'json', 'array'], // Allowed data types
        default: 'string',
        description: 'The data type of the setting value (helps with validation/UI rendering).'
    },
    isEditable: {
        type: Boolean,
        default: true,
        description: 'Whether this setting can be edited via the admin UI.'
    },
    category: {
        type: String,
        default: 'General',
        trim: true,
        description: 'Category for grouping settings in the UI (e.g., General, Payments, Security).'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Optional: Seed initial settings if the collection is empty
SettingSchema.statics.seedInitialSettings = async function() {
    const count = await this.countDocuments();
    if (count === 0) {
        console.log('Seeding initial application settings...');
        await this.insertMany([
            {
                key: 'platformFeePercentage',
                value: 0.10, // Store as decimal (e.g., 0.10 for 10%)
                description: 'Platform fee percentage charged on successful payments.',
                type: 'number',
                category: 'Payments',
                isEditable: true
            },
            {
                key: 'sessionTimeoutMinutesAdmin',
                value: 15,
                description: 'Session timeout duration in minutes for Admin users.',
                type: 'number',
                category: 'Security',
                 isEditable: true
            },
            {
                key: 'sessionTimeoutMinutesDefault',
                value: 30,
                description: 'Default session timeout duration in minutes for non-Admin users.',
                type: 'number',
                category: 'Security',
                 isEditable: true
            },
            // Add more default settings as needed
             {
                key: 'siteName',
                value: 'Visiting Vet Platform',
                description: 'The public name of the website.',
                type: 'string',
                category: 'General',
                 isEditable: true
            }
        ]);
        console.log('Initial settings seeded.');
    }
};

module.exports = mongoose.model('Setting', SettingSchema); 
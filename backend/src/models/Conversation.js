const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    // Optional: Link conversation to a specific context
    // appointment: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Appointment',
    // },
    // serviceRequest: {
    //      type: mongoose.Schema.Types.ObjectId,
    //      ref: 'ServiceRequest',
    // },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    // Store unread counts per participant for efficiency?
    // unreadCounts: [{ 
    //     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    //     count: { type: Number, default: 0 }
    // }],

}, { timestamps: true });

// Ensure participants array always has at least two users?
// conversationSchema.path('participants').validate(function(value) {
//   return value.length >= 2;
// }, 'A conversation must have at least two participants.');

// Index for efficiently finding conversations by participants
// Note: Order matters for this index unless using $all
conversationSchema.index({ participants: 1 }); 

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation; 
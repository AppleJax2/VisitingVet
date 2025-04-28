const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: { // Denormalize recipient for easier querying of user's messages?
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Index for finding messages sent TO a user
    },
    body: {
        type: String,
        required: true,
        trim: true,
        maxlength: [2000, 'Message body cannot exceed 2000 characters'],
    },
    readAt: { // Timestamp when the recipient read the message
        type: Date,
        index: true, // Index for finding unread messages
    },
}, { timestamps: true });

// Index for sorting messages within a conversation
messageSchema.index({ conversationId: 1, createdAt: 1 }); 

// After saving a message, update the corresponding conversation's lastMessage field
messageSchema.post('save', async function(doc, next) {
    try {
        const Conversation = mongoose.model('Conversation');
        await Conversation.findByIdAndUpdate(doc.conversationId, { lastMessage: doc._id });
        
        // TODO: Trigger real-time event via WebSocket
        // TODO: Trigger notification if recipient is offline
        console.log(`Updated lastMessage for conversation ${doc.conversationId}`);
        
    } catch (error) {
        console.error('Error updating conversation lastMessage:', error);
        // Don't block the main operation if this fails, but log it.
    }
    next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 
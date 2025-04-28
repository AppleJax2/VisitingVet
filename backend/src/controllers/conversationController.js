const asyncHandler = require('../middleware/asyncHandler');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all conversations for the logged-in user
 * @route   GET /api/v1/conversations
 * @access  Private
 */
exports.getConversations = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    // Find conversations where the user is a participant
    const conversations = await Conversation.find({ participants: userId })
        .populate({
            path: 'participants',
            match: { _id: { $ne: userId } }, // Exclude self from populated participants
            select: 'name email role profileImage' // Select fields for the other participant(s)
        })
        .populate({
            path: 'lastMessage',
            select: 'body sender readAt createdAt',
            populate: { path: 'sender', select: 'name' }
        })
        .sort({ updatedAt: -1 }); // Sort by last activity (updatedAt)
        
    // Calculate unread count for each conversation (messages sent TO me that are unread)
    const conversationsWithUnread = await Promise.all(conversations.map(async (convo) => {
        const unreadCount = await Message.countDocuments({
            conversationId: convo._id,
            recipient: userId,
            readAt: null
        });
        // Return conversation as plain object to add unreadCount property
        const convoObj = convo.toObject(); 
        convoObj.unreadCount = unreadCount;
        // Simplify participants array - assuming mostly 1-on-1 chats for now
        convoObj.otherParticipant = convoObj.participants?.[0] || null;
        // delete convoObj.participants; // Clean up original participants array
        return convoObj;
    }));

    res.status(200).json({ success: true, count: conversationsWithUnread.length, data: conversationsWithUnread });
});

/**
 * @desc    Get messages for a specific conversation
 * @route   GET /api/v1/conversations/:conversationId/messages
 * @access  Private
 */
exports.getMessagesForConversation = asyncHandler(async (req, res, next) => {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { limit = 30, before } = req.query; // Pagination: limit, and optional message ID to fetch messages before

    // 1. Verify user is part of the conversation
    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId
    }).select('_id'); // Only need to check existence

    if (!conversation) {
        return next(new ErrorResponse('Conversation not found or user not authorized', 404));
    }

    // 2. Build query for messages
    const query = { conversationId: conversationId };
    if (before) {
        // If 'before' is provided, find messages created before that message's timestamp
        try {
            const beforeMessage = await Message.findById(before).select('createdAt');
            if (beforeMessage) {
                 query.createdAt = { $lt: beforeMessage.createdAt };
            } else {
                 console.warn(`'before' message ID ${before} not found, fetching latest messages.`);
            }
        } catch (err) {
             console.warn(`Invalid 'before' message ID ${before}, fetching latest messages.`);
        }
    }

    // 3. Fetch messages
    const messages = await Message.find(query)
        .populate('sender', 'name profileImage') // Populate sender info
        .sort({ createdAt: -1 }) // Get latest first for pagination logic
        .limit(parseInt(limit));

    // Messages are fetched latest first, reverse for chronological display in frontend
    messages.reverse(); 

    res.status(200).json({ success: true, count: messages.length, data: messages });
});

/**
 * @desc    Start a new conversation (find existing or create)
 * @route   POST /api/v1/conversations/start
 * @access  Private
 */
exports.startConversation = asyncHandler(async (req, res, next) => {
    const { recipientId } = req.body;
    const senderId = req.user.id;

    if (!recipientId) {
        return next(new ErrorResponse('Recipient ID is required to start a conversation', 400));
    }
    if (recipientId === senderId.toString()) {
         return next(new ErrorResponse('Cannot start a conversation with yourself', 400));
    }

    // Check if recipient exists
    const recipientExists = await User.findById(recipientId).select('_id');
    if (!recipientExists) {
        return next(new ErrorResponse(`Recipient user not found with ID ${recipientId}`, 404));
    }

    // Find or create the conversation
     const conversation = await Conversation.findOneAndUpdate(
        {
            participants: { $all: [senderId, recipientId], $size: 2 } 
        },
        { 
            // Set participants if creating
            $setOnInsert: { participants: [senderId, recipientId] }
        },
        { 
            upsert: true, 
            new: true, 
            setDefaultsOnInsert: true
        }
    ).populate({
        path: 'participants',
        match: { _id: { $ne: senderId } },
        select: 'name email role profileImage'
    }).populate({
        path: 'lastMessage',
        select: 'body sender readAt createdAt',
        populate: { path: 'sender', select: 'name' }
    });
    
    // Format like getConversations
    const convoObj = conversation.toObject();
    convoObj.otherParticipant = convoObj.participants?.[0] || null;
    convoObj.unreadCount = await Message.countDocuments({ conversationId: convoObj._id, recipient: senderId, readAt: null });
    // delete convoObj.participants;

    res.status(200).json({ success: true, data: convoObj });
}); 
const jwt = require('jsonwebtoken');
const config = require('./config');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

// Store connected users (userId -> Set<socket.id>)
const userIdOnlineStatus = new Map(); 

// Socket.IO Authentication Middleware
const authenticateSocket = async (socket, next) => {
    // Extract token from handshake (e.g., from query or auth header)
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
        console.log('Socket Auth Error: No token provided');
        return next(new Error('Authentication error: No token'));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);
        
        // Get user from the token
        const user = await User.findById(decoded.id).select('_id name role'); // Select necessary fields
        
        if (!user) {
             console.log(`Socket Auth Error: User not found for token ID ${decoded.id}`);
            return next(new Error('Authentication error: User not found'));
        }

        // Attach user to the socket object
        socket.user = user;
        next();
    } catch (error) {
        console.error('Socket Authentication Error:', error.message);
        next(new Error('Authentication error: Invalid token'));
    }
};

// Function to configure Socket.IO event handlers
const configureSocket = (io) => {

    // Apply authentication middleware to all incoming connections
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        const userName = socket.user.name;
        console.log(`User connected: ${userName} (${userId}), Socket ID: ${socket.id}`);
        
        // Add socket ID to the user's set
        if (!userIdOnlineStatus.has(userId)) {
            userIdOnlineStatus.set(userId, new Set());
        }
        userIdOnlineStatus.get(userId).add(socket.id);
        console.log(`User ${userId} now has ${userIdOnlineStatus.get(userId).size} connection(s).`);

        // Join a room specific to the user ID
        socket.join(userId);

        // --- Event Handler: Send Message ---
        socket.on('sendMessage', async (data, callback) => {
            const { recipientId, content, conversationId: providedConvId } = data; // Renamed 'body' to 'content' to match Message model
            const senderId = socket.user._id;
            const senderName = socket.user.name; // Get sender name for notification

            if (!recipientId || !content) {
                 console.error('sendMessage error: Missing recipientId or content');
                return callback({ success: false, error: 'Missing recipient or message content' });
            }
            
            try {
                // 1. Find or Create Conversation
                let conversation;
                if (providedConvId) {
                    // If conversation ID is provided, verify user is part of it
                    conversation = await Conversation.findOne({
                         _id: providedConvId, 
                         participants: { $all: [senderId, recipientId] } // Ensure both sender & intended recipient are participants
                    });
                    if (!conversation) {
                        console.error(`sendMessage error: User ${senderId} or ${recipientId} not part of provided conversation ${providedConvId}`);
                        return callback({ success: false, error: 'Invalid conversation ID or recipient for this conversation' });
                    }
                } else {
                    // Find existing conversation between the two users
                    conversation = await Conversation.findOneAndUpdate(
                        {
                            participants: { $all: [senderId, recipientId], $size: 2 } // Ensure exactly these two participants
                        },
                        { 
                            $set: { updatedAt: new Date() } // Touch conversation timestamp
                        },
                        { 
                            upsert: true, // Create if doesn't exist
                            new: true, // Return the new doc if created
                            setDefaultsOnInsert: true
                        }
                    );
                }

                // 2. Create the Message
                const message = await Message.create({
                    conversationId: conversation._id,
                    sender: senderId,
                    receiver: recipientId, // Use receiver field as per Message model
                    content: content
                });
                
                // Populate sender details for emission
                const populatedMessage = await message.populate('sender', 'name profileImage');
                const messageObject = populatedMessage.toObject(); // Use plain object for emission

                // 3. Emit message to recipient's room (if they are online)
                const isRecipientOnline = userIdOnlineStatus.has(recipientId.toString());
                if (isRecipientOnline) {
                    io.to(recipientId.toString()).emit('newMessage', messageObject);
                    console.log(`Message emitted to online recipient ${recipientId}`);
                } else {
                    // 4. Create Notification if recipient is offline
                    console.log(`Recipient ${recipientId} is offline. Creating notification.`);
                    await Notification.create({
                        user: recipientId,
                        title: `New message from ${senderName}`,
                        message: `You have a new message in your conversation.`, // Or use message.content snippet safely
                        type: 'new_message',
                        referenceId: conversation._id,
                        referenceModel: 'Conversation',
                        actionUrl: `/dashboard/messages/${conversation._id}` // Example URL, adjust as needed
                    });
                    console.log(`Notification created for offline recipient ${recipientId}`);
                    // TODO: Optionally trigger email/push notification service here
                }
                
                // 5. Emit message back to sender's other sockets/tabs for confirmation/sync
                 socket.to(senderId.toString()).emit('newMessage', messageObject);
                 
                 // 6. Acknowledge message sent successfully to the originating socket
                callback({ success: true, message: messageObject });
                console.log(`Message sent from ${senderId} to ${recipientId} in convo ${conversation._id}. Recipient online: ${isRecipientOnline}`);

            } catch (error) {
                console.error('Error sending message:', error);
                callback({ success: false, error: 'Failed to send message' });
            }
        });

        // --- Event Handler: Mark as Read ---
        socket.on('markAsRead', async (data) => {
             const { conversationId } = data;
             const userId = socket.user._id;
             console.log(`User ${userId} marked conversation ${conversationId} as read`);
             try {
                // Update messages in the conversation sent *to* this user that haven't been read
                // Assuming 'read' field exists in Message model and is boolean
                const result = await Message.updateMany(
                    { conversationId: conversationId, receiver: userId, read: false }, // Changed from recipient to receiver, readAt to read
                    { $set: { read: true } } // Set read to true
                );
                 console.log(`Marked ${result.modifiedCount} messages as read for convo ${conversationId}, user ${userId}`);
                 // TODO: Emit an event back confirming read status update?
                 // io.to(userId).emit('conversationRead', { conversationId });
             } catch (error) {
                  console.error(`Error marking messages as read for convo ${conversationId}, user ${userId}:`, error);
             }
        });

        // --- Handle Disconnect ---
        socket.on('disconnect', () => {
            const userId = Array.from(userIdOnlineStatus.entries())
                             .find(([_, socketSet]) => socketSet.has(socket.id))?.[0];
            
            if (userId) {
                const userSockets = userIdOnlineStatus.get(userId);
                userSockets.delete(socket.id);
                console.log(`Socket ${socket.id} disconnected for user ${userId}. Remaining connections: ${userSockets.size}`);
                if (userSockets.size === 0) {
                    userIdOnlineStatus.delete(userId);
                    console.log(`User ${userId} is now offline.`);
                }
            } else {
                console.log(`Socket ${socket.id} disconnected, but user ID was not found in tracking map.`);
            }
        });

         // TODO: Add handlers for typing indicators ('typing', 'stopTyping')
    });

    console.log('Socket.IO configured and listening for connections.');
};

// Helper function to check if a user has any active sockets
// const isUserOnline = (userId) => {
//     for (const [socketId, connectedUserId] of connectedUsers.entries()) {
//         if (connectedUserId === userId.toString()) {
//             return true;
//         }
//     }
//     return false;
// };

module.exports = configureSocket; 
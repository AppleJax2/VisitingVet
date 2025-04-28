const { Server } = require("socket.io");
const logger = require("../utils/logger");
const { authenticateAdminSocket } = require("../middleware/authMiddleware"); // Assuming a socket auth middleware

let io = null;

class WebSocketService {

    /**
     * Initializes the Socket.IO server and attaches it to the HTTP server.
     * Sets up connection handling and authentication.
     * @param {http.Server} httpServer - The Node.js HTTP server instance.
     */
    initialize(httpServer) {
        io = new Server(httpServer, {
            cors: {
                // Configure CORS appropriately for your frontend
                origin: process.env.CLIENT_URL || "http://localhost:3000", 
                methods: ["GET", "POST"],
                // credentials: true // If using cookies/sessions for auth
            }
        });

        logger.info('Socket.IO server initialized and attached to HTTP server.');

        // Use authentication middleware for socket connections
        io.use(authenticateAdminSocket); 

        io.on('connection', (socket) => {
            logger.info(`Admin user connected: ${socket.user?.id} (Socket ID: ${socket.id})`);

            // Example: Join a room for admin updates
            socket.join('admin-analytics');
            logger.info(`Socket ${socket.id} joined room 'admin-analytics'`);

            socket.on('disconnect', (reason) => {
                logger.info(`Admin user disconnected: ${socket.user?.id} (Socket ID: ${socket.id}). Reason: ${reason}`);
            });

            // Handle potential errors on the socket
            socket.on('error', (error) => {
                 logger.error(`Socket error for user ${socket.user?.id} (Socket ID: ${socket.id}):`, error);
            });

            // Placeholder for specific event subscriptions from client if needed
            // socket.on('subscribeToMetric', (metricName) => { ... });
        });
    }

    /**
     * Emits an event to all connected clients in a specific room.
     * @param {string} room - The room to emit to (e.g., 'admin-analytics').
     * @param {string} eventName - The name of the event (e.g., 'newUser', 'verificationUpdate').
     * @param {*} data - The data payload to send with the event.
     */
    emitToRoom(room, eventName, data) {
        if (io) {
             logger.debug(`Emitting event '${eventName}' to room '${room}'`, data ? { payloadKeys: Object.keys(data) } : {});
            io.to(room).emit(eventName, data);
        } else {
            logger.warn('Socket.IO server not initialized. Cannot emit event.');
        }
    }
    
    /**
     * Emits an analytics update event to the admin analytics room.
     * @param {string} metricType - Identifier for the metric being updated (e.g., 'userGrowth', 'verificationStatus').
     * @param {*} payload - The updated data.
     */
    emitAnalyticsUpdate(metricType, payload) {
        this.emitToRoom('admin-analytics', 'analyticsUpdate', { metricType, payload });
    }
    
    /**
     * Get the Socket.IO instance.
     * @returns {Server|null} The Socket.IO server instance or null if not initialized.
     */
    getServerInstance() {
        return io;
    }
}

// Export a singleton instance
module.exports = new WebSocketService(); 
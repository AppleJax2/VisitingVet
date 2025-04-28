const express = require('express');
const http = require('http'); // Import http module
const reportGenerationService = require('./services/reportGenerationService'); // Import the service
const webSocketService = require('./services/websocketService'); // Corrected import name

const app = express();
const server = http.createServer(app); // Create HTTP server instance

// ... app setup (middleware, database connection) ...

// --- Initialize WebSocket Server ---
webSocketService.initialize(server); // Pass the HTTP server instance

// --- Setup Scheduled Tasks ---
reportGenerationService.setupScheduledReports();

// ... route setup ...

// ... error handling middleware ...

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
}); 
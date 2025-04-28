const express = require('express');
const http = require('http'); // Import http module
const reportGenerationService = require('./services/reportGenerationService'); // Import the service
const webSocketService = require('./services/websocketService'); // Corrected import name
const path = require('path'); // Add path import
const cookieParser = require('cookie-parser'); // Import cookie-parser
const helmet = require('helmet'); // Import helmet
const cors = require('cors'); // Import cors
const mongoSanitize = require('express-mongo-sanitize'); // Import mongoSanitize
const hpp = require('hpp'); // Import hpp
const morgan = require('morgan'); // Import morgan
const limiter = require('./middlewares/rateLimiter'); // Import rate limiter
const errorHandler = require('./middlewares/errorHandler'); // Import error handler

// Route files
const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // Import upload routes
const settingsRoutes = require('./routes/settingsRoutes'); // Import settings routes

const app = express();
const server = http.createServer(app); // Create HTTP server instance

// Body parser middleware (ensure it's before routes)
app.use(express.json()); 

// Add webhook route BEFORE json parsing for raw body
const paymentRoutes = require('./routes/paymentRoutes');
const paymentController = require('./controllers/paymentController');
app.post('/api/v1/payments/webhook', express.raw({type: 'application/json'}), paymentController.handleStripeWebhook);

// Cookie parser
app.use(cookieParser());

// Security middleware (Helmet, CORS, rate limiting, hpp, sanitize)
app.use(helmet());
app.use(cors(corsOptions));
app.use(mongoSanitize());
app.use(hpp());
app.use(limiter); // Apply rate limiting

// Logging middleware (e.g., Morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set static folder - Make files in /public accessible
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/pets', petRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/profiles', profileRoutes);
// Mount other routers...
app.use('/api/v1/payments', paymentRoutes); // Mount other payment routes AFTER webhook
app.use('/api/v1/upload', uploadRoutes); // Mount upload routes
app.use('/api/v1/settings', settingsRoutes); // Mount settings routes

// Error handler middleware (should be last)
app.use(errorHandler);

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
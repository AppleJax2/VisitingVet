console.log('--- server.js execution started ---');

const express = require('express');
const http = require('http'); // Required for Socket.IO
const { Server } = require("socket.io"); // Import Socket.IO Server
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const serviceRequestRoutes = require('./src/routes/serviceRequestRoutes');
const availabilityRoutes = require('./src/routes/availabilityRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const petRoutes = require('./src/routes/petRoutes');
const reminderRoutes = require('./src/routes/reminderRoutes');
const clinicRoutes = require('./src/routes/clinicRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const userRoutes = require('./src/routes/userRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const conversationRoutes = require('./src/routes/conversationRoutes'); // Import conversation routes
const videoRoutes = require('./src/routes/videoRoutes'); // Import video routes
const configureSocket = require('./src/config/socket'); // Import socket configuration logic
const sanitizeInputs = require('./src/middleware/inputSanitizer'); // Import the sanitizer middleware
const { adminApiLimiter } = require('./src/middleware/rateLimiter'); // Import the rate limiter

// Import Services
const usageTrackingService = require('./src/services/usageTrackingService'); // Import Usage Tracking Service

// Log environment and important variables (without sensitive values)
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
// Ensure MONGODB_URI exists before attempting connection
if (!process.env.MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI environment variable is not set.');
  process.exit(1);
}
console.log('MongoDB URI exists check passed.');
console.log('JWT Secret exists:', !!process.env.JWT_SECRET);

// Function to attempt database connection with retries
const connectWithRetry = async (maxRetries = 5, retryDelay = 5000) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`Database connection attempt ${retries + 1} of ${maxRetries}...`);
      const dbConnection = await connectDB();
      
      if (dbConnection) {
        console.log('Database connection successful after', retries > 0 ? `${retries} retries.` : 'first attempt.');
        return dbConnection;
      }
      
      // If connectDB returns null (in production), we should retry
      console.log(`Database connection returned null, retrying in ${retryDelay/1000} seconds...`);
    } catch (error) {
      console.error(`Connection attempt ${retries + 1} failed:`, error.message);
      
      // Special handling for replica set issues
      if (error.name === 'MongoServerSelectionError' && error.message.includes('primary marked stale')) {
        console.log('Detected stale primary error - likely a temporary replica set election issue');
      }
    }
    
    retries++;
    if (retries < maxRetries) {
      console.log(`Waiting ${retryDelay/1000} seconds before retry ${retries + 1}...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  // If we reach here, all retries failed
  throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
};

// Wrap the server startup in an async function to allow await for connectDB
const startServer = async () => {
  console.log('--- startServer function called ---');
  try {
    // Connect to database with retry mechanism
    console.log('Attempting database connection with retry mechanism...');
    const dbConnection = await connectWithRetry();
    console.log('Database connection successful and stable.');

    const app = express();
    const server = http.createServer(app); // Create HTTP server from Express app

    // Configure CORS options (allow frontend URL)
    const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173'];
    console.log('Allowed CORS origins:', allowedOrigins);
    const corsOptions = {
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests) or from allowed origins
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                console.error(`CORS Error: Origin '${origin}' not allowed.`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true, // Allow cookies/auth headers
    };

    // Setup Socket.IO Server
    const io = new Server(server, {
      cors: corsOptions // Apply CORS options to Socket.IO
    });

    // Apply CORS middleware to Express app
    app.use(cors(corsOptions));

    // Apply API usage logging middleware
    app.use(usageTrackingService.logApiCallMiddleware);

    // IMPORTANT: Stripe webhook needs raw body, so define it BEFORE express.json()
    app.use('/api/payments/webhook', express.raw({type: 'application/json'}), (req, res, next) => {
        const paymentRouter = require('./src/routes/paymentRoutes');
        const webhookHandler = paymentRouter.stack.find(layer => layer.route && layer.route.path === '/webhook' && layer.route.methods.post);
        if (webhookHandler && webhookHandler.handle) {
            webhookHandler.handle(req, res, next);
        } else {
            console.error('Stripe webhook handler not found in paymentRoutes');
            res.status(404).send('Webhook endpoint not configured correctly');
        }
    });

    // Body parser - MUST be after the raw body route for webhook
    app.use(express.json());

    // Cookie parser
    app.use(cookieParser());

    // Mount routers
    console.log('Mounting routes...');
    app.use('/api/auth', authRoutes);
    app.use('/api/profiles', profileRoutes);
    app.use('/api/profiles', serviceRoutes); // Note: Duplicate mount path for /api/profiles
    app.use('/api/service-requests', serviceRequestRoutes);
    app.use('/api/availability', availabilityRoutes);
    app.use('/api/appointments', appointmentRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/pets', petRoutes);
    app.use('/api/reminders', reminderRoutes);
    app.use('/api/clinics', clinicRoutes);
    app.use('/api/admin', adminApiLimiter, sanitizeInputs, adminRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/conversations', conversationRoutes);
    app.use('/api/video', videoRoutes);
    console.log('Routes mounted.');

    // Configure Socket.IO event handlers
    console.log('Configuring Socket.IO...');
    configureSocket(io);
    console.log('Socket.IO configured.');

    // Basic route for testing
    app.get('/', (req, res) => {
        res.send('VisitingVet API Running');
    });

    const PORT = process.env.PORT || 5000;

    // Handle unhandled promise rejections (register before listen)
    process.on('unhandledRejection', (err, promise) => {
      console.error(`Unhandled Rejection at: ${promise}, reason: ${err.message}`);
      console.error(err.stack); // Log stack trace
      // Optionally, implement more robust error handling/reporting here
      // For production, consider graceful shutdown or alerting
      if (process.env.NODE_ENV !== 'production') {
          // In dev, crashing might be preferable to diagnose
          server.close(() => process.exit(1));
      }
      // In production, we log but might let it continue, depending on the error
    });

    // Start the server using the http server instance, not the express app
    server.listen(PORT, () => {
        console.log(
          `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
        );
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Call the async function to start the server
startServer(); 
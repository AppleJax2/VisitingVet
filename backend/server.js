const express = require('express');
const http = require('http'); // Required for Socket.IO
const { Server } = require("socket.io"); // Import Socket.IO Server
const dotenv = require('dotenv');
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

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app

// Configure CORS options (allow frontend URL)
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173'];
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests) or from allowed origins
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies/auth headers
};

// Setup Socket.IO Server
const io = new Server(server, {
  cors: corsOptions // Apply CORS options to Socket.IO
});

// Apply CORS middleware to Express app (might be redundant if Socket.IO handles it? Check docs)
app.use(cors(corsOptions));

// IMPORTANT: Stripe webhook needs raw body, so define it BEFORE express.json()
// We need to mount the webhook route separately here.
app.use('/api/payments/webhook', express.raw({type: 'application/json'}), (req, res, next) => {
    // Find the specific webhook handler from paymentRoutes and call it
    const paymentRouter = require('./src/routes/paymentRoutes');
    // Manually find the route handler for POST /webhook
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
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/profiles', serviceRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/conversations', conversationRoutes); // Mount conversation routes
app.use('/api/video', videoRoutes); // Mount video routes

// Configure Socket.IO event handlers
configureSocket(io);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('VisitingVet API Running');
});

const PORT = process.env.PORT || 5000;

// Start the server using the http server instance, not the express app
server.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 
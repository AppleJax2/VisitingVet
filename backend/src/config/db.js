console.log('--- db.js execution started ---');
const mongoose = require('mongoose');
// Remove dotenv and path requires as Render injects env vars
// const dotenv = require('dotenv');
// const path = require('path');

// Removed the block that attempted to load .env files

const connectDB = async () => {
  console.log('--- connectDB function called ---');
  try {
    // Log MongoDB connection attempt
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not defined in environment variables');
      console.log('Available environment variables:', Object.keys(process.env).filter(key => !key.includes('SECRET')));
      throw new Error('MONGODB_URI is not defined');
    }
    
    // Log a sanitized version of the URI (hiding credentials)
    const sanitizedUri = mongoUri.replace(/:\/\/[^@]*@/, '://****:****@');
    console.log(`Attempting to connect to MongoDB: ${sanitizedUri}`);
    
    // Add advanced options to handle replica set issues
    const mongooseOptions = {
      serverSelectionTimeoutMS: 30000, // Increase timeout for server selection
      socketTimeoutMS: 45000, // Increase socket timeout
      heartbeatFrequencyMS: 5000, // More frequent heartbeats to detect changes
      maxPoolSize: 10, // Control the connection pool size
      minPoolSize: 3, // Maintain minimum connections
      retryWrites: true, // Enable retry for write operations
      retryReads: true, // Enable retry for read operations
      connectTimeoutMS: 30000, // Connection timeout
      family: 4, // Use IPv4, skip trying IPv6
    };
    
    // Connect with enhanced options
    const conn = await mongoose.connect(mongoUri, mongooseOptions);
    
    // Setup connection event listeners for monitoring
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    if (error.name === 'MongoParseError') {
      console.error('This may indicate an invalid MongoDB connection string');
    } else if (error.name === 'MongoNetworkError') {
      console.error('This may indicate network issues or incorrect credentials');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Failed to select MongoDB server. Check if the server is running and accessible');
      console.error('This could be due to a replica set election or reconfiguration');
      
      // Add more specific handling for the StalePrimaryError
      if (error.message.includes('primary marked stale')) {
        console.error('Detected stale primary error - this is typically temporary during replica set elections');
        console.error('Will attempt to reconnect with the topology');
      }
    }
    
    // Only exit in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1); // Exit process with failure
    } else {
      console.error('Database connection failed but continuing execution due to production environment.');
      
      // In production, retry connection after delay instead of returning null
      console.log('Will retry connection in 5 seconds...');
      setTimeout(() => {
        console.log('Retrying MongoDB connection...');
        connectDB().catch(err => console.error('Retry connection failed:', err.message));
      }, 5000);
      
      return null;
    }
  }
};

module.exports = connectDB; 
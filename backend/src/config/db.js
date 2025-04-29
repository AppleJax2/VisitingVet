console.log('--- db.js execution started ---');
const mongoose = require('mongoose');
// Remove dotenv and path requires as Render injects env vars
// const dotenv = require('dotenv');
// const path = require('path');

// Remove dotenv loading logic
/*
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), './src/config/.env'),
  path.resolve(process.cwd(), '../.env')
];

for (const envPath of envPaths) {
  console.log(`Trying to load .env from: ${envPath}`);
  dotenv.config({ path: envPath });
}
*/

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
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (error.name === 'MongoParseError') {
      console.error('This may indicate an invalid MongoDB connection string');
    } else if (error.name === 'MongoNetworkError') {
      console.error('This may indicate network issues or incorrect credentials');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Failed to select MongoDB server. Check if the server is running and accessible');
    }
    
    // Only exit in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1); // Exit process with failure
    } else {
      console.error('Database connection failed but continuing execution due to production environment.');
      return null;
    }
  }
};

module.exports = connectDB; 
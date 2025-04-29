console.log('--- db.js execution started ---');
const mongoose = require('mongoose');

// Print out all non-sensitive environment variables for debugging
const envVars = Object.keys(process.env)
  .filter(key => !key.toLowerCase().includes('key') && !key.toLowerCase().includes('secret') && !key.toLowerCase().includes('password'))
  .reduce((obj, key) => {
    obj[key] = process.env[key];
    return obj;
  }, {});

console.log('--- Environment Variables (non-sensitive) ---');
console.log(JSON.stringify(envVars, null, 2));

// Very simplified connection function with basic error handling
const connectDB = async () => {
  try {
    console.log('--- Simple connectDB function called ---');
    
    // 1. Check for MONGODB_URI
    if (!process.env.MONGODB_URI) {
      console.log('!!! MONGODB_URI environment variable is not set !!!');
      process.exit(1);
    }
    
    console.log('--- MONGODB_URI exists, attempting connection ---');
    
    // 2. Attempt connection with minimal options
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('--- MongoDB Connected Successfully ---');
    return conn;
  } catch (error) {
    console.log('!!! MongoDB Connection Error !!!');
    console.log('Error Type:', error.name);
    console.log('Error Message:', error.message);
    console.log('Error Stack:', error.stack);
    
    // Always exit in both dev and production with detailed error
    console.log('!!! Exiting due to MongoDB connection failure !!!');
    process.exit(1);
  }
};

module.exports = connectDB; 
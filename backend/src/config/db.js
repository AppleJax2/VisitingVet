const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './../../.env' }); // Adjust path relative to this file's location

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB; 
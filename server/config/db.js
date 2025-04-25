const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // These options fix deprecation warnings and ensure compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      dbName: 'dlsl-lfims' // Explicitly set database name
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Continuing without database connection...');
    // Don't exit the process so the app can run without DB if needed
  }
};

module.exports = connectDB; 
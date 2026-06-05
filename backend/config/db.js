const mongoose = require('mongoose');

async function connectDB() {
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('Missing MongoDB connection string');
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
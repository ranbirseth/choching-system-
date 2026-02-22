const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI?.trim();
    if (!uri) {
      throw new Error('MONGO_URI is not defined');
    }

    // Mask password in logs
    const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
    console.log(`Attempting to connect to MongoDB with URI: ${maskedUri}`);

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected successfully to host: ${conn.connection.host}`);
    console.log('Database name:', conn.connection.name);
  } catch (error) {
    console.error(`DATABASE CONNECTION ERROR: ${error.message}`);
    console.log('Check your MONGO_URI in Render Settings. It should NOT contain "?tuitionDB="');
    process.exit(1);
  }
};

module.exports = connectDB;

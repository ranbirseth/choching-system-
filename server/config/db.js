const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI?.trim();
    if (!uri) {
      throw new Error('MONGO_URI is not defined');
    }

    // Auto-fix for the common "tuitionDB" parameter error if it exists
    if (uri.includes('?tuitionDB=')) {
      console.log('Detecting malformed URI (?tuitionDB=). Attempting auto-fix...');
      // Replace something like ...mongodb.net/?tuitionDB=Name with ...mongodb.net/Name?retryWrites=true
      uri = uri.replace(/\/\?tuitionDB=([^&]+)/, '/$1?retryWrites=true&w=majority');
    }

    // Mask password for safe logging
    const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
    console.log(`Attempting to connect with URI: ${maskedUri}`);

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

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to connect to the database
    // We use the variable from our .env file to keep credentials safe
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    // Exit process with failure code if DB is essential
    // (In a real resilience scenario, we might want to retry, but for this assignment, 
    // alerting the dev and restarting via a process manager like PM2 is standard)
    process.exit(1);
  }
};

module.exports = connectDB;
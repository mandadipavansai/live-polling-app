const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  // FIXED: Changed from [String] to an array of Objects
  options: [{
    option: { type: String, required: true },
    count: { type: Number, default: 0 }
  }],
  duration: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  startTime: { type: Date, default: Date.now }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Poll', PollSchema);
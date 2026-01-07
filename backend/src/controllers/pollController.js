const Poll = require('../models/Poll');

exports.getPollHistory = async (req, res) => {
  try {
    // Fetch all inactive polls (history)
    const polls = await Poll.find({ isActive: false })
      .sort({ createdAt: -1 })
      .limit(10); 
      
    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.clearHistory = async (req, res) => {
  try {
    await Poll.deleteMany({ isActive: false }); // Deletes only closed polls
    res.status(200).json({ message: "History cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
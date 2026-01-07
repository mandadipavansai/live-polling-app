const Poll = require('../models/Poll');
const Vote = require('../models/Vote');

// Helper to calculate time left
const getRemainingTime = (poll) => {
  if (!poll.isActive) return 0;
  const now = new Date();
  const elapsedSeconds = Math.floor((now - new Date(poll.startTime)) / 1000);
  const remaining = poll.duration - elapsedSeconds;
  return remaining > 0 ? remaining : 0;
};

// 1. Create Poll
exports.createPoll = async (data) => {
  // Close any existing open polls first
  await Poll.updateMany({ isActive: true }, { isActive: false });

  // Ensure options have a 'count' field starting at 0
  const formattedOptions = data.options.map(opt => ({ option: opt, count: 0 }));

  const poll = await Poll.create({
    question: data.question,
    options: formattedOptions, 
    duration: data.duration,
    startTime: new Date(),
    isActive: true 
  });

  // Auto-Close Timer (Safety fallback)
  setTimeout(async () => {
    try {
      await Poll.findByIdAndUpdate(poll._id, { isActive: false });
      console.log(`Poll ${poll._id} moved to history.`);
    } catch (err) {
      console.error("Error closing poll:", err);
    }
  }, data.duration * 1000);

  return poll;
};

// 2. Get Current State (THE MISSING FUNCTION)
exports.getCurrentPollState = async (studentId) => {
  const currentPoll = await Poll.findOne({ isActive: true }).sort({ createdAt: -1 });
  
  if (!currentPoll) return null;

  const remainingTime = getRemainingTime(currentPoll);
  
  if (remainingTime <= 0) {
    currentPoll.isActive = false;
    await currentPoll.save();
    return null; 
  }

  let hasVoted = false;
  let votedOption = null;
  
  if (studentId) {
    const vote = await Vote.findOne({ pollId: currentPoll._id, studentId });
    if (vote) {
      hasVoted = true;
      votedOption = vote.optionIndex;
    }
  }

  return {
    _id: currentPoll._id,
    question: currentPoll.question,
    options: currentPoll.options,
    duration: currentPoll.duration,
    remainingTime,
    hasVoted,
    votedOption
  };
};

// 3. Submit Vote
exports.submitVote = async (pollId, studentId, optionIndex) => {
  const poll = await Poll.findById(pollId);
  if (!poll || !poll.isActive) throw new Error("Poll is closed.");

  // Prevent Double Voting
  try {
    await Vote.create({ pollId, studentId, optionIndex });
  } catch (error) {
    if (error.code === 11000) throw new Error("You have already voted.");
    throw error;
  }

  // Increment the count in the Poll document (Critical for History)
  poll.options[optionIndex].count += 1;
  await poll.save();

  return poll;
};

// 4. Get Results
exports.getPollResults = async (pollId) => {
  const poll = await Poll.findById(pollId);
  return poll ? poll.options : [];
};
const pollService = require('../services/pollService');

// Store connected students: { socketId: { studentId, name } }
let connectedStudents = {};

module.exports = (io, socket) => {
  
  // --- 1. Student Management ---
  socket.on('student_join', ({ studentId, name }) => {
    connectedStudents[socket.id] = { studentId, name };
    io.emit('update_student_list', Object.values(connectedStudents));
  });

  socket.on('request_participants', () => {
    socket.emit('update_student_list', Object.values(connectedStudents));
  });

  socket.on('kick_student', (studentId) => {
    const targetSocketId = Object.keys(connectedStudents).find(
      id => connectedStudents[id].studentId === studentId
    );
    if (targetSocketId) {
      io.to(targetSocketId).emit('kicked'); 
      io.sockets.sockets.get(targetSocketId)?.disconnect(true);
      delete connectedStudents[targetSocketId];
      io.emit('update_student_list', Object.values(connectedStudents));
    }
  });

  socket.on('disconnect', () => {
    if (connectedStudents[socket.id]) {
      delete connectedStudents[socket.id];
      io.emit('update_student_list', Object.values(connectedStudents));
    }
  });

  // --- 2. Poll Logic ---
  socket.on('create_poll', async (data) => {
    try {
      const newPoll = await pollService.createPoll(data);
      io.emit('poll_created', newPoll);
    } catch (err) {
      socket.emit('error', { message: 'Failed to create poll' });
    }
  });

  socket.on('submit_vote', async ({ pollId, studentId, optionIndex }) => {
    try {
      await pollService.submitVote(pollId, studentId, optionIndex);
      const results = await pollService.getPollResults(pollId);
      io.emit('update_results', results);
      socket.emit('vote_success', { optionIndex });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Request State (Safe Destructuring)
  socket.on('request_state', async (data = {}) => {
    try {
      const { studentId } = data;
      // This is where your error was happening
      const state = await pollService.getCurrentPollState(studentId);
      
      if (state) {
        socket.emit('sync_state', state);
        // Send current results immediately
        const results = await pollService.getPollResults(state._id);
        socket.emit('update_results', results);
      }
    } catch (err) {
      console.error("Error in request_state:", err);
    }
  });

  // --- 3. Chat Feature ---
  socket.on('send_chat', (data) => {
    io.emit('receive_chat', data);
  });
};
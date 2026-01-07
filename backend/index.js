require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app'); // Import the configured App
const pollSocketHandler = require('./src/sockets/pollSocketHandler');

const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from React
    methods: ["GET", "POST"]
  }
});

// Initialize Socket Logic
io.on('connection', (socket) => {
  pollSocketHandler(io, socket);
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
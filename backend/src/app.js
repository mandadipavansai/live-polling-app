const express = require('express');
const cors = require('cors');
const pollRoutes = require('./routes/pollRoutes');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/polls', pollRoutes);

module.exports = app;
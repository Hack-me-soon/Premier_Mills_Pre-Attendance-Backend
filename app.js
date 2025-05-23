const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const allowedOrigins = [
  "https://premiermills.netlify.app", // Netlify frontend
];

app.use(cors({
  origin: allowedOrigins,
})); // Accepts only specified origins

// Parse incoming JSON
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

module.exports = app;

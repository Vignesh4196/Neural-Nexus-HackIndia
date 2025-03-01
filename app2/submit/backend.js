// backend/server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const mongoose = require('mongoose');
const { logMiddleware, errorHandler } = require('./middleware/logger');
const authRoutes = require('./routes/auth');
const assistantRoutes = require('./routes/assistant');
const integrationRoutes = require('./routes/integrations');

const app = express();

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('Database Error:', err));

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// Core Middleware
app.use(express.json({ limit: '10kb' }));
app.use(logMiddleware);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/assistant', assistantRoutes);
app.use('/api/v1/integrations', integrationRoutes);

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
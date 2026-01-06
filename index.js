// server.js - Modular Express Backend for Portfolio
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/config');
const { limiter, contactLimiter } = require('./middleware/rateLimit');

// Import routes
const healthRoutes = require('./routes/health');
const projectRoutes = require('./routes/projects');
const skillRoutes = require('./routes/skills');
const contactRoutes = require('./routes/contacts');
const statRoutes = require('./routes/stats');
const uploadRoutes = require('./routes/uploads');
const authRoutes = require('./routes/auth');

const app = express();

// Trust proxy for accurate IP detection (required for Render)
app.set('trust proxy', 1);

// Middleware
app.use(helmet());

// Explicit CORS handling for preflight OPTIONS requests
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://mojeed-rho.vercel.app',
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.use(cors({
  origin: config.CORS_ORIGINS,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
app.use('/api/', limiter);

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/contacts', contactRoutes); // Admin routes
app.use('/api/stats', statRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ✅ Use Render-assigned port
const PORT = process.env.PORT || config.PORT || 10000;
const API_URL = process.env.API_URL || `http://localhost`;

app.listen(PORT, () => {
  console.log(`🚀 Portfolio API Server running on port ${PORT}`);
  console.log(`📊 Health check: ${API_URL}:${PORT}/api/health`);
  console.log(`💼 Projects API: ${API_URL}:${PORT}/api/projects`);
  console.log(`🎯 Skills API: ${API_URL}:${PORT}/api/skills`);
  console.log(`📧 Contact API: ${API_URL}:${PORT}/api/contact`);
});

module.exports = app;

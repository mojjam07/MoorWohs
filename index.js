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

app.listen(PORT, () => {
  console.log(`🚀 Portfolio API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💼 Projects API: http://localhost:${PORT}/api/projects`);
  console.log(`🎯 Skills API: http://localhost:${PORT}/api/skills`);
  console.log(`📧 Contact API: http://localhost:${PORT}/api/contact`);
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// Import middlewares
const { 
  generalLimiter, 
  securityHeaders, 
  sanitizeInput, 
  errorHandler, 
  notFoundHandler 
} = require('./middlewares/security');

// Import routes
const routes = require('./routes');

// Import database
const { testConnection } = require('./config/database');

const app = express();

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(generalLimiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Static files (for uploaded documents)
app.use('/uploads', express.static('uploads'));

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}`, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Scholarship Management API',
    version: API_VERSION,
    documentation: `/api/${API_VERSION}/health`,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database connection
const initializeApp = async () => {
  try {
    await testConnection();
    console.log('✅ Database connected successfully');
    
    // Sync database models (only in development)
    if (process.env.NODE_ENV === 'development') {
      const { sequelize } = require('./models');
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    }
    
    return app;
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
};

module.exports = { app, initializeApp };
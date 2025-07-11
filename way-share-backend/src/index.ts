import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import reportRoutes from './routes/reportRoutes';
import heatmapRoutes from './routes/heatmapRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import identityVerificationRoutes from './routes/identityVerificationRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import adminRoutes from './routes/adminRoutes';
import incidentRoutes from './routes/incidentRoutes';
import driverScoreRoutes from './routes/driverScoreRoutes';
import rewardsRoutes from './routes/rewardsRoutes';
import { db } from './services/database';
import { authService } from './services/authService';

const app = express();

// Make authService available to controllers
app.locals.authService = authService;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS configuration
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Stripe webhook needs raw body - must come before body parsing
app.use('/api/v2/identity/webhook', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing for refresh tokens
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', async (_req, res) => {
  const dbHealth = await db.healthCheck();
  res.json({
    success: true,
    message: 'Way-Share API is running',
    timestamp: new Date().toISOString(),
    database: dbHealth,
  });
});

// API routes
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/heatmap', heatmapRoutes);

// v2 API routes for authenticated features
app.use('/api/v2/auth', authRoutes);
app.use('/api/v2/user', userRoutes);
app.use('/api/v2/identity', identityVerificationRoutes);
app.use('/api/v2/user/vehicles', vehicleRoutes);
app.use('/api/v2/admin', adminRoutes);
app.use('/api/v2/incidents', incidentRoutes);
app.use('/api/v2/driver-score', driverScoreRoutes);
app.use('/api/v2/rewards', rewardsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database connection and start server
async function startServer() {
  try {
    // Connect to database
    await db.connect();
    
    // Start server
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`Way-Share API server running on port ${PORT} in ${config.env} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await db.close();
  process.exit(0);
});

startServer();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import reportRoutes from './routes/reportRoutes';
import heatmapRoutes from './routes/heatmapRoutes';
import { db } from './services/database';

const app = express();

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

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
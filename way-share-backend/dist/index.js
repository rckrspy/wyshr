"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config/config");
const errorHandler_1 = require("./middleware/errorHandler");
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const heatmapRoutes_1 = __importDefault(require("./routes/heatmapRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const identityVerificationRoutes_1 = __importDefault(require("./routes/identityVerificationRoutes"));
const vehicleRoutes_1 = __importDefault(require("./routes/vehicleRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const incidentRoutes_1 = __importDefault(require("./routes/incidentRoutes"));
const driverScoreRoutes_1 = __importDefault(require("./routes/driverScoreRoutes"));
const rewardsRoutes_1 = __importDefault(require("./routes/rewardsRoutes"));
const database_1 = require("./services/database");
const authService_1 = require("./services/authService");
const app = (0, express_1.default)();
// Make authService available to controllers
app.locals.authService = authService_1.authService;
// Security middleware
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)(config_1.config.cors));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.maxRequests,
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
app.use('/api/v2/identity/webhook', express_1.default.raw({ type: 'application/json' }));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Cookie parsing for refresh tokens
app.use((0, cookie_parser_1.default)());
// Compression
app.use((0, compression_1.default)());
// Logging
if (config_1.config.env === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// Health check endpoint
app.get('/health', async (_req, res) => {
    const dbHealth = await database_1.db.healthCheck();
    res.json({
        success: true,
        message: 'Way-Share API is running',
        timestamp: new Date().toISOString(),
        database: dbHealth,
    });
});
// API routes
app.use('/api/v1/reports', reportRoutes_1.default);
app.use('/api/v1/heatmap', heatmapRoutes_1.default);
// v2 API routes for authenticated features
app.use('/api/v2/auth', authRoutes_1.default);
app.use('/api/v2/user', userRoutes_1.default);
app.use('/api/v2/identity', identityVerificationRoutes_1.default);
app.use('/api/v2/user/vehicles', vehicleRoutes_1.default);
app.use('/api/v2/admin', adminRoutes_1.default);
app.use('/api/v2/incidents', incidentRoutes_1.default);
app.use('/api/v2/driver-score', driverScoreRoutes_1.default);
app.use('/api/v2/rewards', rewardsRoutes_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Initialize database connection and start server
async function startServer() {
    try {
        // Connect to database
        await database_1.db.connect();
        // Start server
        const PORT = config_1.config.port;
        app.listen(PORT, () => {
            console.log(`Way-Share API server running on port ${PORT} in ${config_1.config.env} mode`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await database_1.db.close();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await database_1.db.close();
    process.exit(0);
});
startServer();

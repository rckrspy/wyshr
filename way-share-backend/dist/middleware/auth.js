"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.requireVerified = exports.optionalAuthenticate = exports.requireVerifiedEmail = exports.authenticateWithUserVerification = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const database_1 = __importDefault(require("../services/database"));
/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'No token provided',
            });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            // Check if it's an access token
            if (decoded.type !== 'access') {
                res.status(401).json({
                    success: false,
                    message: 'Invalid token type',
                });
                return;
            }
            // Trust JWT payload for basic user info (optimized - no DB query)
            req.user = {
                id: decoded.userId,
                email: decoded.email,
            };
            req.userId = decoded.userId; // For backward compatibility
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid token',
                });
                return;
            }
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({
                    success: false,
                    message: 'Token expired',
                });
                return;
            }
            throw error;
        }
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
/**
 * Middleware to verify user exists in database (for sensitive operations)
 * Use this only when you need to ensure the user still exists and is active
 */
const authenticateWithUserVerification = async (req, res, next) => {
    try {
        // First run basic authentication
        await (0, exports.authenticate)(req, res, () => { });
        if (!req.user) {
            return; // authenticate already sent error response
        }
        // Verify user still exists and is active
        const userResult = await database_1.default.query('SELECT id, email, email_verified, identity_verified FROM users WHERE id = $1', [req.user.id]);
        if (userResult.rows.length === 0) {
            res.status(401).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }
        // Update user info with fresh data from database
        const user = userResult.rows[0];
        req.user = {
            id: user.id,
            email: user.email,
            emailVerified: user.email_verified,
            identityVerified: user.identity_verified,
        };
        next();
    }
    catch (error) {
        console.error('User verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication verification failed',
        });
    }
};
exports.authenticateWithUserVerification = authenticateWithUserVerification;
/**
 * Middleware to require verified email
 */
const requireVerifiedEmail = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const userResult = await database_1.default.query('SELECT email_verified FROM users WHERE id = $1', [req.user.id]);
        if (userResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (!userResult.rows[0].email_verified) {
            res.status(403).json({
                success: false,
                message: 'Email verification required',
            });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireVerifiedEmail = requireVerifiedEmail;
/**
 * Optional authentication - attaches user if token is valid but doesn't require it
 */
const optionalAuthenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without user
            next();
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            if (decoded.type === 'access') {
                req.user = {
                    id: decoded.userId,
                    email: decoded.email,
                };
                req.userId = decoded.userId; // For backward compatibility
            }
        }
        catch {
            // Invalid token, continue without user
            console.log('Optional auth: Invalid token provided');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.optionalAuthenticate = optionalAuthenticate;
/**
 * Middleware to require verified identity (for driver score features)
 */
const requireVerified = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const userResult = await database_1.default.query('SELECT identity_verified FROM users WHERE id = $1', [req.user.id]);
        if (userResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (!userResult.rows[0].identity_verified) {
            res.status(403).json({
                success: false,
                message: 'Identity verification required',
            });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireVerified = requireVerified;
// Alias for backward compatibility
exports.authenticateToken = exports.authenticate;

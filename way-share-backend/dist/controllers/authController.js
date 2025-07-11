"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.authValidation = exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const authService_1 = require("../services/authService");
class AuthController {
    /**
     * Register a new user
     */
    async register(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { email, password } = req.body;
            const user = await authService_1.authService.register(email, password);
            res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email to verify your account.',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        emailVerified: user.email_verified,
                    },
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Login user
     */
    async login(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { email, password } = req.body;
            const userAgent = req.get('user-agent');
            const ipAddress = req.ip;
            const { user, tokens } = await authService_1.authService.login(email, password, userAgent, ipAddress);
            // Set refresh token as HTTP-only cookie
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        emailVerified: user.email_verified,
                    },
                    accessToken: tokens.accessToken,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Logout user
     */
    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (refreshToken) {
                await authService_1.authService.logout(refreshToken);
            }
            // Clear refresh token cookie
            res.clearCookie('refreshToken');
            res.json({
                success: true,
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Refresh access token
     */
    async refresh(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!refreshToken) {
                res.status(401).json({
                    success: false,
                    message: 'Refresh token not provided',
                });
                return;
            }
            const tokens = await authService_1.authService.refreshAccessToken(refreshToken);
            // Update refresh token cookie
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            res.json({
                success: true,
                data: {
                    accessToken: tokens.accessToken,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Verify email
     */
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.params;
            await authService_1.authService.verifyEmail(token);
            res.json({
                success: true,
                message: 'Email verified successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Request password reset
     */
    async forgotPassword(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { email } = req.body;
            await authService_1.authService.requestPasswordReset(email);
            // Always return success to prevent email enumeration
            res.json({
                success: true,
                message: 'If an account exists with this email, you will receive password reset instructions.',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Reset password
     */
    async resetPassword(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { token, newPassword } = req.body;
            await authService_1.authService.resetPassword(token, newPassword);
            res.json({
                success: true,
                message: 'Password reset successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
// Validation middleware
exports.authValidation = {
    register: [
        (0, express_validator_1.body)('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        (0, express_validator_1.body)('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
        (0, express_validator_1.body)('confirmPassword')
            .custom((value, { req }) => value === req.body.password)
            .withMessage('Passwords do not match'),
    ],
    login: [
        (0, express_validator_1.body)('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        (0, express_validator_1.body)('password')
            .notEmpty()
            .withMessage('Password is required'),
    ],
    forgotPassword: [
        (0, express_validator_1.body)('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
    ],
    resetPassword: [
        (0, express_validator_1.body)('token')
            .notEmpty()
            .withMessage('Reset token is required'),
        (0, express_validator_1.body)('newPassword')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
        (0, express_validator_1.body)('confirmPassword')
            .custom((value, { req }) => value === req.body.newPassword)
            .withMessage('Passwords do not match'),
    ],
};
exports.authController = new AuthController();

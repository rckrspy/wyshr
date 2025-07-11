"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = exports.validateRewardQuoteRequest = exports.validateRefreshToken = exports.validateResetPassword = exports.validateForgotPassword = exports.validateLogin = exports.validateRegistration = void 0;
const express_validator_1 = require("express-validator");
// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Password requirements: at least 8 characters, one uppercase, one lowercase, one number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
exports.validateRegistration = [
    (0, express_validator_1.body)('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .matches(emailRegex).withMessage('Invalid email format')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .matches(passwordRegex).withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'),
];
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .matches(emailRegex).withMessage('Invalid email format')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .trim()
        .notEmpty().withMessage('Password is required'),
];
exports.validateForgotPassword = [
    (0, express_validator_1.body)('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .matches(emailRegex).withMessage('Invalid email format')
        .normalizeEmail(),
];
exports.validateResetPassword = [
    (0, express_validator_1.body)('token')
        .trim()
        .notEmpty().withMessage('Reset token is required')
        .isLength({ min: 64, max: 64 }).withMessage('Invalid reset token'),
    (0, express_validator_1.body)('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .matches(passwordRegex).withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'),
];
exports.validateRefreshToken = [
    (0, express_validator_1.body)('refreshToken')
        .trim()
        .notEmpty().withMessage('Refresh token is required')
        .isLength({ min: 64, max: 64 }).withMessage('Invalid refresh token'),
];
exports.validateRewardQuoteRequest = [
    (0, express_validator_1.body)('partner_id')
        .trim()
        .notEmpty().withMessage('Partner ID is required')
        .isUUID().withMessage('Invalid partner ID format'),
    (0, express_validator_1.body)('contact_method')
        .trim()
        .notEmpty().withMessage('Contact method is required')
        .isIn(['email', 'phone']).withMessage('Contact method must be either email or phone'),
    (0, express_validator_1.body)('contact_email')
        .optional()
        .trim()
        .matches(emailRegex).withMessage('Invalid email format')
        .normalizeEmail(),
    (0, express_validator_1.body)('contact_phone')
        .optional()
        .trim()
        .matches(/^\+?[\d\s\-()]+$/).withMessage('Invalid phone number format'),
    (0, express_validator_1.body)('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes must be 500 characters or less'),
];
// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;

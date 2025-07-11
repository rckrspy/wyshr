import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements: at least 8 characters, one uppercase, one lowercase, one number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const validateRegistration = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .matches(emailRegex).withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .matches(passwordRegex).withMessage(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    ),
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .matches(emailRegex).withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required'),
];

export const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .matches(emailRegex).withMessage('Invalid email format')
    .normalizeEmail(),
];

export const validateResetPassword = [
  body('token')
    .trim()
    .notEmpty().withMessage('Reset token is required')
    .isLength({ min: 64, max: 64 }).withMessage('Invalid reset token'),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .matches(passwordRegex).withMessage(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    ),
];

export const validateRefreshToken = [
  body('refreshToken')
    .trim()
    .notEmpty().withMessage('Refresh token is required')
    .isLength({ min: 64, max: 64 }).withMessage('Invalid refresh token'),
];

export const validateRewardQuoteRequest = [
  body('partner_id')
    .trim()
    .notEmpty().withMessage('Partner ID is required')
    .isUUID().withMessage('Invalid partner ID format'),
  body('contact_method')
    .trim()
    .notEmpty().withMessage('Contact method is required')
    .isIn(['email', 'phone']).withMessage('Contact method must be either email or phone'),
  body('contact_email')
    .optional()
    .trim()
    .matches(emailRegex).withMessage('Invalid email format')
    .normalizeEmail(),
  body('contact_phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-()]+$/).withMessage('Invalid phone number format'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be 500 characters or less'),
];

// Middleware to handle validation errors
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};
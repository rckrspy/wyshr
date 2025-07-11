import { Router } from 'express';
import * as identityVerificationController from '../controllers/identityVerificationController';
import { authenticateToken } from '../middleware/auth';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/authValidation';

const router = Router();

// Webhook endpoint (no auth)
router.post(
  '/webhook',
  identityVerificationController.handleStripeWebhook
);

// All other routes require authentication
router.use(authenticateToken);

// Create verification session
router.post(
  '/session',
  [
    body('returnUrl').isURL().withMessage('Valid return URL is required'),
    body('refreshUrl').isURL().withMessage('Valid refresh URL is required'),
  ],
  handleValidationErrors,
  identityVerificationController.createVerificationSession
);

// Get current verification status
router.get(
  '/status',
  identityVerificationController.getVerificationStatus
);

// Check specific session status
router.get(
  '/session/:sessionId',
  [
    param('sessionId').notEmpty().withMessage('Session ID is required'),
  ],
  handleValidationErrors,
  identityVerificationController.checkSessionStatus
);

// Cancel pending verification
router.post(
  '/cancel',
  identityVerificationController.cancelVerification
);

export default router;
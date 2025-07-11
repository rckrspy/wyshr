import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/authValidation';

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);

// Get pending verifications
router.get(
  '/verifications/pending',
  [
    query('type').optional().isIn(['vehicle_verification', 'identity_verification']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  handleValidationErrors,
  adminController.getPendingVerifications
);

// Get verification details
router.get(
  '/verifications/:id',
  [
    param('id').isUUID().withMessage('Invalid verification ID'),
    query('type').notEmpty().isIn(['vehicle_verification', 'identity_verification']),
  ],
  handleValidationErrors,
  adminController.getVerificationDetails
);

// Submit review decision
router.post(
  '/verifications/:id/review',
  [
    param('id').isUUID().withMessage('Invalid verification ID'),
    body('type').notEmpty().isIn(['vehicle_verification', 'identity_verification', 'incident_dispute']),
    body('action').notEmpty().isIn(['approved', 'rejected', 'requested_info', 'escalated']),
    body('notes').optional().isString().isLength({ max: 1000 }),
  ],
  handleValidationErrors,
  adminController.submitReview
);

// Get admin statistics
router.get('/stats', adminController.getAdminStats);

// Admin user management (admin role only)
router.get('/users', adminController.getAdminUsers);

router.post(
  '/users',
  [
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('role').notEmpty().isIn(['admin', 'reviewer']),
    body('permissions').optional().isObject(),
  ],
  handleValidationErrors,
  adminController.createAdminUser
);

router.put(
  '/users/:id/status',
  [
    param('id').isUUID().withMessage('Invalid admin ID'),
    body('isActive').isBoolean().withMessage('isActive must be boolean'),
  ],
  handleValidationErrors,
  adminController.updateAdminStatus
);

// Activity logs
router.get(
  '/activity-logs',
  [
    query('limit').optional().isInt({ min: 1, max: 500 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  handleValidationErrors,
  adminController.getActivityLogs
);

export default router;
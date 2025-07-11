import { Router } from 'express';
import { userIncidentController } from '../controllers/userIncidentController';
import { authenticateToken } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get user incidents
router.get('/', userIncidentController.getUserIncidents);

// Notification routes (must come before dynamic routes)
router.get('/notifications', userIncidentController.getNotifications);
router.post('/notifications/:id/read', userIncidentController.markNotificationRead);
router.post('/notifications/read-all', userIncidentController.markAllNotificationsRead);
router.get('/notifications/preferences', userIncidentController.getNotificationPreferences);
router.put('/notifications/preferences', [
  body('email_incidents').optional().isBoolean(),
  body('push_incidents').optional().isBoolean(),
  body('email_disputes').optional().isBoolean(),
  body('push_disputes').optional().isBoolean(),
  body('email_vehicle_updates').optional().isBoolean(),
  body('push_vehicle_updates').optional().isBoolean()
], userIncidentController.updateNotificationPreferences);

// Get specific incident (dynamic route - must come after specific routes)
router.get('/:id', userIncidentController.getIncident);

// Mark incident as viewed
router.post('/:id/viewed', userIncidentController.markViewed);

// Create dispute
router.post('/:id/dispute', [
  body('disputeType')
    .isIn(['not_me', 'incorrect_details', 'wrong_vehicle', 'false_report', 'other'])
    .withMessage('Invalid dispute type'),
  body('description')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('supportingEvidenceUrls')
    .optional()
    .isArray()
    .withMessage('Supporting evidence must be an array of URLs'),
  body('supportingEvidenceUrls.*')
    .optional()
    .isURL()
    .withMessage('Invalid URL in supporting evidence')
], userIncidentController.createDispute);

// Update incident note
router.put('/:id/notes', [
  body('note')
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must not exceed 500 characters')
], userIncidentController.updateNote);

export default router;
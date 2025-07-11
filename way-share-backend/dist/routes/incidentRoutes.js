"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userIncidentController_1 = require("../controllers/userIncidentController");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Get user incidents
router.get('/', userIncidentController_1.userIncidentController.getUserIncidents);
// Notification routes (must come before dynamic routes)
router.get('/notifications', userIncidentController_1.userIncidentController.getNotifications);
router.post('/notifications/:id/read', userIncidentController_1.userIncidentController.markNotificationRead);
router.post('/notifications/read-all', userIncidentController_1.userIncidentController.markAllNotificationsRead);
router.get('/notifications/preferences', userIncidentController_1.userIncidentController.getNotificationPreferences);
router.put('/notifications/preferences', [
    (0, express_validator_1.body)('email_incidents').optional().isBoolean(),
    (0, express_validator_1.body)('push_incidents').optional().isBoolean(),
    (0, express_validator_1.body)('email_disputes').optional().isBoolean(),
    (0, express_validator_1.body)('push_disputes').optional().isBoolean(),
    (0, express_validator_1.body)('email_vehicle_updates').optional().isBoolean(),
    (0, express_validator_1.body)('push_vehicle_updates').optional().isBoolean()
], userIncidentController_1.userIncidentController.updateNotificationPreferences);
// Get specific incident (dynamic route - must come after specific routes)
router.get('/:id', userIncidentController_1.userIncidentController.getIncident);
// Mark incident as viewed
router.post('/:id/viewed', userIncidentController_1.userIncidentController.markViewed);
// Create dispute
router.post('/:id/dispute', [
    (0, express_validator_1.body)('disputeType')
        .isIn(['not_me', 'incorrect_details', 'wrong_vehicle', 'false_report', 'other'])
        .withMessage('Invalid dispute type'),
    (0, express_validator_1.body)('description')
        .isString()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    (0, express_validator_1.body)('supportingEvidenceUrls')
        .optional()
        .isArray()
        .withMessage('Supporting evidence must be an array of URLs'),
    (0, express_validator_1.body)('supportingEvidenceUrls.*')
        .optional()
        .isURL()
        .withMessage('Invalid URL in supporting evidence')
], userIncidentController_1.userIncidentController.createDispute);
// Update incident note
router.put('/:id/notes', [
    (0, express_validator_1.body)('note')
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Note must not exceed 500 characters')
], userIncidentController_1.userIncidentController.updateNote);
exports.default = router;

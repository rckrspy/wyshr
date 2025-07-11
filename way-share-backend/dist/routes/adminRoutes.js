"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController = __importStar(require("../controllers/adminController"));
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const authValidation_1 = require("../middleware/authValidation");
const router = (0, express_1.Router)();
// All admin routes require authentication
router.use(auth_1.authenticateToken);
// Get pending verifications
router.get('/verifications/pending', [
    (0, express_validator_1.query)('type').optional().isIn(['vehicle_verification', 'identity_verification']),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }),
], authValidation_1.handleValidationErrors, adminController.getPendingVerifications);
// Get verification details
router.get('/verifications/:id', [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid verification ID'),
    (0, express_validator_1.query)('type').notEmpty().isIn(['vehicle_verification', 'identity_verification']),
], authValidation_1.handleValidationErrors, adminController.getVerificationDetails);
// Submit review decision
router.post('/verifications/:id/review', [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid verification ID'),
    (0, express_validator_1.body)('type').notEmpty().isIn(['vehicle_verification', 'identity_verification', 'incident_dispute']),
    (0, express_validator_1.body)('action').notEmpty().isIn(['approved', 'rejected', 'requested_info', 'escalated']),
    (0, express_validator_1.body)('notes').optional().isString().isLength({ max: 1000 }),
], authValidation_1.handleValidationErrors, adminController.submitReview);
// Get admin statistics
router.get('/stats', adminController.getAdminStats);
// Admin user management (admin role only)
router.get('/users', adminController.getAdminUsers);
router.post('/users', [
    (0, express_validator_1.body)('userId').isUUID().withMessage('Invalid user ID'),
    (0, express_validator_1.body)('role').notEmpty().isIn(['admin', 'reviewer']),
    (0, express_validator_1.body)('permissions').optional().isObject(),
], authValidation_1.handleValidationErrors, adminController.createAdminUser);
router.put('/users/:id/status', [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid admin ID'),
    (0, express_validator_1.body)('isActive').isBoolean().withMessage('isActive must be boolean'),
], authValidation_1.handleValidationErrors, adminController.updateAdminStatus);
// Activity logs
router.get('/activity-logs', [
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 500 }),
    (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }),
], authValidation_1.handleValidationErrors, adminController.getActivityLogs);
exports.default = router;

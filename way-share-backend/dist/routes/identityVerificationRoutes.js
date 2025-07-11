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
const identityVerificationController = __importStar(require("../controllers/identityVerificationController"));
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const authValidation_1 = require("../middleware/authValidation");
const router = (0, express_1.Router)();
// Webhook endpoint (no auth)
router.post('/webhook', identityVerificationController.handleStripeWebhook);
// All other routes require authentication
router.use(auth_1.authenticateToken);
// Create verification session
router.post('/session', [
    (0, express_validator_1.body)('returnUrl').isURL().withMessage('Valid return URL is required'),
    (0, express_validator_1.body)('refreshUrl').isURL().withMessage('Valid refresh URL is required'),
], authValidation_1.handleValidationErrors, identityVerificationController.createVerificationSession);
// Get current verification status
router.get('/status', identityVerificationController.getVerificationStatus);
// Check specific session status
router.get('/session/:sessionId', [
    (0, express_validator_1.param)('sessionId').notEmpty().withMessage('Session ID is required'),
], authValidation_1.handleValidationErrors, identityVerificationController.checkSessionStatus);
// Cancel pending verification
router.post('/cancel', identityVerificationController.cancelVerification);
exports.default = router;

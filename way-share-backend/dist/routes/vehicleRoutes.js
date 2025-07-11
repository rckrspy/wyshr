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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const vehicleController = __importStar(require("../controllers/vehicleController"));
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const authValidation_1 = require("../middleware/authValidation");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf'
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
// All routes require authentication
router.use(auth_1.authenticateToken);
// Create a new vehicle
router.post('/', [
    (0, express_validator_1.body)('licensePlate')
        .trim()
        .notEmpty().withMessage('License plate is required')
        .isLength({ min: 2, max: 15 }).withMessage('Invalid license plate length')
        .matches(/^[A-Z0-9\s-]+$/i).withMessage('Invalid license plate format'),
    (0, express_validator_1.body)('state')
        .trim()
        .notEmpty().withMessage('State is required')
        .isLength({ min: 2, max: 2 }).withMessage('State must be 2 characters')
        .isAlpha().withMessage('Invalid state code'),
    (0, express_validator_1.body)('make').optional().trim().isLength({ max: 50 }),
    (0, express_validator_1.body)('model').optional().trim().isLength({ max: 50 }),
    (0, express_validator_1.body)('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    (0, express_validator_1.body)('color').optional().trim().isLength({ max: 30 }),
    (0, express_validator_1.body)('vin').optional().trim().isLength({ min: 17, max: 17 }).isAlphanumeric(),
], authValidation_1.handleValidationErrors, vehicleController.createVehicle);
// Get all user's vehicles
router.get('/', vehicleController.getUserVehicles);
// Get a specific vehicle
router.get('/:id', [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid vehicle ID'),
], authValidation_1.handleValidationErrors, vehicleController.getVehicle);
// Delete a vehicle
router.delete('/:id', [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid vehicle ID'),
], authValidation_1.handleValidationErrors, vehicleController.deleteVehicle);
// Upload verification document
router.post('/:id/verify', upload.single('document'), [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid vehicle ID'),
    (0, express_validator_1.body)('documentType')
        .notEmpty().withMessage('Document type is required')
        .isIn(['insurance', 'registration', 'title']).withMessage('Invalid document type'),
], authValidation_1.handleValidationErrors, vehicleController.uploadVerificationDocument);
// Get verification status
router.get('/:id/verification-status', [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid vehicle ID'),
], authValidation_1.handleValidationErrors, vehicleController.getVerificationStatus);
exports.default = router;

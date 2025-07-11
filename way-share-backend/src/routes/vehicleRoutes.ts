import { Router } from 'express';
import multer from 'multer';
import * as vehicleController from '../controllers/vehicleController';
import { authenticateToken } from '../middleware/auth';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/authValidation';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
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
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// All routes require authentication
router.use(authenticateToken);

// Create a new vehicle
router.post(
  '/',
  [
    body('licensePlate')
      .trim()
      .notEmpty().withMessage('License plate is required')
      .isLength({ min: 2, max: 15 }).withMessage('Invalid license plate length')
      .matches(/^[A-Z0-9\s-]+$/i).withMessage('Invalid license plate format'),
    body('state')
      .trim()
      .notEmpty().withMessage('State is required')
      .isLength({ min: 2, max: 2 }).withMessage('State must be 2 characters')
      .isAlpha().withMessage('Invalid state code'),
    body('make').optional().trim().isLength({ max: 50 }),
    body('model').optional().trim().isLength({ max: 50 }),
    body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body('color').optional().trim().isLength({ max: 30 }),
    body('vin').optional().trim().isLength({ min: 17, max: 17 }).isAlphanumeric(),
  ],
  handleValidationErrors,
  vehicleController.createVehicle
);

// Get all user's vehicles
router.get('/', vehicleController.getUserVehicles);

// Get a specific vehicle
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid vehicle ID'),
  ],
  handleValidationErrors,
  vehicleController.getVehicle
);

// Delete a vehicle
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid vehicle ID'),
  ],
  handleValidationErrors,
  vehicleController.deleteVehicle
);

// Upload verification document
router.post(
  '/:id/verify',
  upload.single('document'),
  [
    param('id').isUUID().withMessage('Invalid vehicle ID'),
    body('documentType')
      .notEmpty().withMessage('Document type is required')
      .isIn(['insurance', 'registration', 'title']).withMessage('Invalid document type'),
  ],
  handleValidationErrors,
  vehicleController.uploadVerificationDocument
);

// Get verification status
router.get(
  '/:id/verification-status',
  [
    param('id').isUUID().withMessage('Invalid vehicle ID'),
  ],
  handleValidationErrors,
  vehicleController.getVerificationStatus
);

export default router;
import { Router } from 'express';
import { submitReport, getRecentReports } from '../controllers/reportController';
import { getIncidentTypes, getIncidentTypeDetails } from '../controllers/incidentController';
import { validateReportSubmission } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Submit a new report (anonymous)
router.post('/', validateReportSubmission, asyncHandler(submitReport));

// Get recent reports (for testing/admin - remove in production)
router.get('/recent', asyncHandler(getRecentReports));

// Get incident types metadata
router.get('/incident-types', asyncHandler(getIncidentTypes));

// Get specific incident type details
router.get('/incident-types/:type', asyncHandler(getIncidentTypeDetails));

export default router;
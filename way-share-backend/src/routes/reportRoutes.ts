import { Router } from 'express';
import { submitReport, getRecentReports } from '../controllers/reportController';
// import { getIncidentTypes, getIncidentTypeDetails } from '../controllers/incidentController'; // Removed - not part of Phase 2
import { validateReportSubmission } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Submit a new report (anonymous)
router.post('/', validateReportSubmission, asyncHandler(submitReport));

// Get recent reports (for testing/admin - remove in production)
router.get('/recent', asyncHandler(getRecentReports));

// Get incident types metadata
// router.get('/incident-types', asyncHandler(getIncidentTypes)); // Removed - not part of Phase 2

// Get specific incident type details
// router.get('/incident-types/:type', asyncHandler(getIncidentTypeDetails)); // Removed - not part of Phase 2

export default router;
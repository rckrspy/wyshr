"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
// import { getIncidentTypes, getIncidentTypeDetails } from '../controllers/incidentController'; // Removed - not part of Phase 2
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// Submit a new report (anonymous)
router.post('/', validation_1.validateReportSubmission, (0, errorHandler_1.asyncHandler)(reportController_1.submitReport));
// Get recent reports (for testing/admin - remove in production)
router.get('/recent', (0, errorHandler_1.asyncHandler)(reportController_1.getRecentReports));
// Get incident types metadata
// router.get('/incident-types', asyncHandler(getIncidentTypes)); // Removed - not part of Phase 2
// Get specific incident type details
// router.get('/incident-types/:type', asyncHandler(getIncidentTypeDetails)); // Removed - not part of Phase 2
exports.default = router;

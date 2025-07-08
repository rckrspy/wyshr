"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const incidentController_1 = require("../controllers/incidentController");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// Submit a new report (anonymous)
router.post('/', validation_1.validateReportSubmission, (0, errorHandler_1.asyncHandler)(reportController_1.submitReport));
// Get recent reports (for testing/admin - remove in production)
router.get('/recent', (0, errorHandler_1.asyncHandler)(reportController_1.getRecentReports));
// Get incident types metadata
router.get('/incident-types', (0, errorHandler_1.asyncHandler)(incidentController_1.getIncidentTypes));
// Get specific incident type details
router.get('/incident-types/:type', (0, errorHandler_1.asyncHandler)(incidentController_1.getIncidentTypeDetails));
exports.default = router;

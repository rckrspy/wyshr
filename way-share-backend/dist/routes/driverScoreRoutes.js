"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const driverScoreController_1 = require("../controllers/driverScoreController");
const router = (0, express_1.Router)();
// All driver score routes require authentication and verified identity
router.use(auth_1.authenticateToken, auth_1.requireVerified);
// Get current driver score with analytics
router.get('/', driverScoreController_1.getDriverScore);
// Get score history
router.get('/history', driverScoreController_1.getScoreHistory);
// Get score breakdown by incident type
router.get('/breakdown', driverScoreController_1.getScoreBreakdown);
// Get percentile ranking
router.get('/percentile', driverScoreController_1.getScorePercentile);
// Get achieved milestones
router.get('/milestones', driverScoreController_1.getMilestones);
// Get incident weight configurations
router.get('/weights', driverScoreController_1.getIncidentWeights);
// Trigger time recovery (admin only in production)
router.post('/recover', driverScoreController_1.triggerTimeRecovery);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rewardsController_1 = require("../controllers/rewardsController");
const auth_1 = require("../middleware/auth");
const authValidation_1 = require("../middleware/authValidation");
const router = (0, express_1.Router)();
// Public routes
router.get('/partners', rewardsController_1.rewardsController.getPartners);
router.get('/partners/:id', rewardsController_1.rewardsController.getPartner);
router.get('/stats', rewardsController_1.rewardsController.getRewardsStats);
// Protected routes
router.get('/eligibility', auth_1.authenticateToken, rewardsController_1.rewardsController.checkEligibility);
router.post('/request-quote', auth_1.authenticateToken, authValidation_1.validateRewardQuoteRequest, rewardsController_1.rewardsController.requestQuote);
router.get('/my-leads', auth_1.authenticateToken, rewardsController_1.rewardsController.getUserLeads);
exports.default = router;

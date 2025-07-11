import { Router } from 'express';
import { rewardsController } from '../controllers/rewardsController';
import { authenticateToken } from '../middleware/auth';
import { validateRewardQuoteRequest } from '../middleware/authValidation';

const router = Router();

// Public routes
router.get('/partners', rewardsController.getPartners);
router.get('/partners/:id', rewardsController.getPartner);
router.get('/stats', rewardsController.getRewardsStats);

// Protected routes
router.get('/eligibility', authenticateToken, rewardsController.checkEligibility);
router.post('/request-quote', authenticateToken, validateRewardQuoteRequest, rewardsController.requestQuote);
router.get('/my-leads', authenticateToken, rewardsController.getUserLeads);

export default router;
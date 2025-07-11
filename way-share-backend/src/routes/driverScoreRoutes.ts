import { Router } from 'express';
import { authenticateToken, requireVerified } from '../middleware/auth';
import {
  getDriverScore,
  getScoreHistory,
  getScoreBreakdown,
  getScorePercentile,
  getMilestones,
  getIncidentWeights,
  triggerTimeRecovery
} from '../controllers/driverScoreController';

const router = Router();

// All driver score routes require authentication and verified identity
router.use(authenticateToken, requireVerified);

// Get current driver score with analytics
router.get('/', getDriverScore);

// Get score history
router.get('/history', getScoreHistory);

// Get score breakdown by incident type
router.get('/breakdown', getScoreBreakdown);

// Get percentile ranking
router.get('/percentile', getScorePercentile);

// Get achieved milestones
router.get('/milestones', getMilestones);

// Get incident weight configurations
router.get('/weights', getIncidentWeights);

// Trigger time recovery (admin only in production)
router.post('/recover', triggerTimeRecovery);

export default router;
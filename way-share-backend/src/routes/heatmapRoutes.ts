import { Router } from 'express';
import { getHeatMapData, getIncidentStats } from '../controllers/heatmapController';
import { validateHeatMapQuery } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Get heat map data
router.get('/data', validateHeatMapQuery, asyncHandler(getHeatMapData));

// Get incident statistics
router.get('/stats', asyncHandler(getIncidentStats));

export default router;
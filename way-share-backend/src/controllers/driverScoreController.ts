import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { driverScoreService } from '../services/driverScoreService';

/**
 * Get current driver score and analytics
 */
export const getDriverScore = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const scoreResult = await driverScoreService.calculateScore(userId);
    
    res.json({
      success: true,
      data: scoreResult
    });
  } catch (error) {
    console.error('Error fetching driver score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch driver score'
    });
  }
};

/**
 * Get driver score history
 */
export const getScoreHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const history = await driverScoreService.getScoreHistory(userId, limit);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching score history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch score history'
    });
  }
};

/**
 * Get score breakdown by incident type
 */
export const getScoreBreakdown = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const breakdown = await driverScoreService.getScoreBreakdown(userId);
    
    res.json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    console.error('Error fetching score breakdown:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch score breakdown'
    });
  }
};

/**
 * Get driver's percentile ranking
 */
export const getScorePercentile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const scoreResult = await driverScoreService.calculateScore(userId);
    
    res.json({
      success: true,
      data: {
        percentile: scoreResult.percentile,
        currentScore: scoreResult.currentScore,
        betterThan: scoreResult.percentile // Percentage of drivers with lower scores
      }
    });
  } catch (error) {
    console.error('Error fetching score percentile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch score percentile'
    });
  }
};

/**
 * Get user's milestones
 */
export const getMilestones = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const milestones = await driverScoreService.checkMilestones(userId);
    
    res.json({
      success: true,
      data: milestones
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch milestones'
    });
  }
};

/**
 * Get incident weight configurations (for informational purposes)
 */
export const getIncidentWeights = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const weights = await driverScoreService.getIncidentWeights();
    
    res.json({
      success: true,
      data: weights
    });
  } catch (error) {
    console.error('Error fetching incident weights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch incident weights'
    });
  }
};

/**
 * Manually trigger time-based recovery (admin only, for testing)
 */
export const triggerTimeRecovery = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // This should be restricted to admin users in production
    const userId = req.body.userId || req.user!.id;
    
    await driverScoreService.applyTimeRecovery(userId);
    
    res.json({
      success: true,
      message: 'Time recovery applied if eligible'
    });
  } catch (error) {
    console.error('Error applying time recovery:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply time recovery'
    });
  }
};
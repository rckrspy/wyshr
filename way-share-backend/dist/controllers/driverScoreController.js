"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerTimeRecovery = exports.getIncidentWeights = exports.getMilestones = exports.getScorePercentile = exports.getScoreBreakdown = exports.getScoreHistory = exports.getDriverScore = void 0;
const driverScoreService_1 = require("../services/driverScoreService");
/**
 * Get current driver score and analytics
 */
const getDriverScore = async (req, res) => {
    try {
        const userId = req.user.id;
        const scoreResult = await driverScoreService_1.driverScoreService.calculateScore(userId);
        res.json({
            success: true,
            data: scoreResult
        });
    }
    catch (error) {
        console.error('Error fetching driver score:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch driver score'
        });
    }
};
exports.getDriverScore = getDriverScore;
/**
 * Get driver score history
 */
const getScoreHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 50;
        const history = await driverScoreService_1.driverScoreService.getScoreHistory(userId, limit);
        res.json({
            success: true,
            data: history
        });
    }
    catch (error) {
        console.error('Error fetching score history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch score history'
        });
    }
};
exports.getScoreHistory = getScoreHistory;
/**
 * Get score breakdown by incident type
 */
const getScoreBreakdown = async (req, res) => {
    try {
        const userId = req.user.id;
        const breakdown = await driverScoreService_1.driverScoreService.getScoreBreakdown(userId);
        res.json({
            success: true,
            data: breakdown
        });
    }
    catch (error) {
        console.error('Error fetching score breakdown:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch score breakdown'
        });
    }
};
exports.getScoreBreakdown = getScoreBreakdown;
/**
 * Get driver's percentile ranking
 */
const getScorePercentile = async (req, res) => {
    try {
        const userId = req.user.id;
        const scoreResult = await driverScoreService_1.driverScoreService.calculateScore(userId);
        res.json({
            success: true,
            data: {
                percentile: scoreResult.percentile,
                currentScore: scoreResult.currentScore,
                betterThan: scoreResult.percentile // Percentage of drivers with lower scores
            }
        });
    }
    catch (error) {
        console.error('Error fetching score percentile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch score percentile'
        });
    }
};
exports.getScorePercentile = getScorePercentile;
/**
 * Get user's milestones
 */
const getMilestones = async (req, res) => {
    try {
        const userId = req.user.id;
        const milestones = await driverScoreService_1.driverScoreService.checkMilestones(userId);
        res.json({
            success: true,
            data: milestones
        });
    }
    catch (error) {
        console.error('Error fetching milestones:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch milestones'
        });
    }
};
exports.getMilestones = getMilestones;
/**
 * Get incident weight configurations (for informational purposes)
 */
const getIncidentWeights = async (_req, res) => {
    try {
        const weights = await driverScoreService_1.driverScoreService.getIncidentWeights();
        res.json({
            success: true,
            data: weights
        });
    }
    catch (error) {
        console.error('Error fetching incident weights:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch incident weights'
        });
    }
};
exports.getIncidentWeights = getIncidentWeights;
/**
 * Manually trigger time-based recovery (admin only, for testing)
 */
const triggerTimeRecovery = async (req, res) => {
    try {
        // This should be restricted to admin users in production
        const userId = req.body.userId || req.user.id;
        await driverScoreService_1.driverScoreService.applyTimeRecovery(userId);
        res.json({
            success: true,
            message: 'Time recovery applied if eligible'
        });
    }
    catch (error) {
        console.error('Error applying time recovery:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to apply time recovery'
        });
    }
};
exports.triggerTimeRecovery = triggerTimeRecovery;

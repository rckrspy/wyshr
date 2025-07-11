"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverScoreService = exports.DriverScoreService = void 0;
const database_1 = require("./database");
class DriverScoreService {
    /**
     * Get the current driver score for a user
     */
    async getDriverScore(userId) {
        const result = await database_1.pool.query('SELECT user_id, current_score, previous_score, score_updated_at FROM driver_scores WHERE user_id = $1', [userId]);
        return result.rows[0] || null;
    }
    /**
     * Calculate and return comprehensive score information
     */
    async calculateScore(userId) {
        // Get current score or initialize if not exists
        let driverScore = await this.getDriverScore(userId);
        if (!driverScore) {
            // Initialize score for new verified user
            await this.initializeScore(userId);
            driverScore = await this.getDriverScore(userId);
        }
        // Get analytics data
        const analyticsResult = await database_1.pool.query(`SELECT 
        incident_count::int,
        disputes_won::int,
        ROUND(score_percentile * 100)::int as score_percentile
      FROM driver_score_analytics 
      WHERE user_id = $1`, [userId]);
        const analytics = analyticsResult.rows[0] || {
            incident_count: 0,
            disputes_won: 0,
            score_percentile: 50
        };
        return {
            currentScore: driverScore.currentScore,
            previousScore: driverScore.previousScore,
            change: driverScore.currentScore - driverScore.previousScore,
            percentile: analytics.score_percentile,
            incidentCount: analytics.incident_count,
            disputesWon: analytics.disputes_won
        };
    }
    /**
     * Initialize driver score for a new verified user
     */
    async initializeScore(userId) {
        await database_1.pool.query('INSERT INTO driver_scores (user_id, current_score, previous_score) VALUES ($1, 80, 80) ON CONFLICT (user_id) DO NOTHING', [userId]);
    }
    /**
     * Process a new incident report against a verified vehicle owner
     */
    async processIncidentReport(report) {
        // Get incident weight configuration
        const weightResult = await database_1.pool.query('SELECT incident_type, base_penalty, severity_multiplier FROM incident_weights WHERE incident_type = $1', [report.incidentType]);
        const weight = weightResult.rows[0];
        if (!weight || weight.basePenalty === 0) {
            // Infrastructure incidents don't affect driver score
            return;
        }
        // Calculate penalty
        const penalty = Math.round(weight.basePenalty * weight.severityMultiplier);
        // Update driver score using stored procedure
        await database_1.pool.query('CALL update_driver_score($1, $2, $3, $4, $5)', [
            report.ownerUserId,
            'incident_reported',
            -penalty, // Negative impact
            `${report.incidentType} incident reported`,
            report.id
        ]);
    }
    /**
     * Process a dispute resolution
     */
    async processDisputeResolution(disputeId, userId, resolution, originalPenalty) {
        if (resolution === 'approved') {
            // Restore the original penalty points
            await database_1.pool.query('CALL update_driver_score($1, $2, $3, $4, NULL, $5)', [
                userId,
                'dispute_resolved',
                originalPenalty, // Positive impact to restore points
                'Dispute resolved in your favor',
                disputeId
            ]);
        }
    }
    /**
     * Apply time-based score recovery
     */
    async applyTimeRecovery(userId) {
        // Calculate recovery points based on days without incidents
        const recoveryResult = await database_1.pool.query('SELECT calculate_score_recovery($1) as recovery_points', [userId]);
        const recoveryPoints = recoveryResult.rows[0]?.recovery_points || 0;
        if (recoveryPoints > 0) {
            await database_1.pool.query('CALL update_driver_score($1, $2, $3, $4)', [
                userId,
                'time_elapsed',
                recoveryPoints,
                `${recoveryPoints} points recovered over time`
            ]);
        }
    }
    /**
     * Get score history for a user
     */
    async getScoreHistory(userId, limit = 50) {
        const result = await database_1.pool.query(`SELECT 
        event_type,
        score_impact,
        description,
        previous_score,
        new_score,
        created_at
      FROM score_events
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2`, [userId, limit]);
        return result.rows;
    }
    /**
     * Get score breakdown by incident type
     */
    async getScoreBreakdown(userId) {
        const result = await database_1.pool.query(`SELECT 
        r.incident_type,
        COUNT(*)::int as count,
        COALESCE(SUM(se.score_impact), 0)::int as total_impact
      FROM reports r
      JOIN score_events se ON se.report_id = r.id
      WHERE r.owner_user_id = $1
      GROUP BY r.incident_type
      ORDER BY total_impact ASC`, [userId]);
        return result.rows;
    }
    /**
     * Check and award milestones
     */
    async checkMilestones(userId) {
        const result = await database_1.pool.query(`SELECT milestone_type, milestone_value, achieved_at
      FROM score_milestones
      WHERE user_id = $1
      ORDER BY achieved_at DESC`, [userId]);
        return result.rows;
    }
    /**
     * Run scheduled job to update time-based recoveries for all users
     */
    async runScheduledRecovery() {
        // Get all users who might be eligible for recovery
        const usersResult = await database_1.pool.query(`SELECT DISTINCT ds.user_id 
      FROM driver_scores ds
      WHERE ds.current_score < 100
      AND NOT EXISTS (
        SELECT 1 FROM score_events se 
        WHERE se.user_id = ds.user_id 
        AND se.event_type = 'time_elapsed'
        AND se.created_at > NOW() - INTERVAL '1 day'
      )`);
        // Apply recovery for each eligible user
        for (const user of usersResult.rows) {
            await this.applyTimeRecovery(user.user_id);
        }
    }
    /**
     * Get incident penalty configuration
     */
    async getIncidentWeights() {
        const result = await database_1.pool.query('SELECT incident_type, base_penalty, severity_multiplier FROM incident_weights ORDER BY base_penalty DESC');
        return result.rows;
    }
}
exports.DriverScoreService = DriverScoreService;
// Export singleton instance
exports.driverScoreService = new DriverScoreService();

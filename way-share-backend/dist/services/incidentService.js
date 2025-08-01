"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentService = exports.IncidentService = void 0;
const database_1 = require("./database");
const anonymization_1 = require("../utils/anonymization");
const notificationService_1 = require("./notificationService");
const driverScoreService_1 = require("./driverScoreService");
class IncidentService {
    async processReport(data) {
        // Check if this report is for a verified vehicle
        let ownerUserId = null;
        let licensePlatePlaintext = null;
        if (data.licensePlate && data.state) {
            const checkQuery = `SELECT check_verified_vehicle_owner($1, $2) as owner_id`;
            const checkResult = await database_1.pool.query(checkQuery, [data.licensePlate, data.state]);
            ownerUserId = checkResult.rows[0]?.owner_id;
            if (ownerUserId) {
                licensePlatePlaintext = data.licensePlate;
            }
        }
        // Create the report with additional fields for verified owners
        const query = `
      INSERT INTO reports (
        session_id,
        license_plate_hash,
        license_plate_plaintext,
        owner_user_id,
        incident_type,
        subcategory,
        location,
        rounded_location,
        description,
        media_url,
        city,
        state,
        is_owner_notified
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        ST_SetSRID(ST_MakePoint($7, $8), 4326),
        round_coordinates($8, $7),
        $9, $10, $11, $12, $13
      )
      RETURNING 
        id,
        session_id,
        license_plate_hash,
        license_plate_plaintext,
        owner_user_id,
        incident_type,
        subcategory,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude,
        description,
        media_url,
        city,
        state,
        created_at,
        is_owner_notified
    `;
        const values = [
            data.sessionId,
            data.licensePlate ? anonymization_1.AnonymizationService.hashLicensePlate(data.licensePlate) : null,
            licensePlatePlaintext,
            ownerUserId,
            data.incidentType,
            data.subcategory || null,
            data.longitude,
            data.latitude,
            data.description || null,
            data.mediaUrl || null,
            data.city || 'Unknown',
            data.state || 'Unknown',
            false // is_owner_notified - will be updated after notification
        ];
        const result = await database_1.pool.query(query, values);
        const report = result.rows[0];
        // Notify the owner if this is their vehicle
        if (ownerUserId) {
            try {
                await notificationService_1.notificationService.notifyOwner(report);
                // Update notification status
                await database_1.pool.query('UPDATE reports SET is_owner_notified = true WHERE id = $1', [report.id]);
                // Update driver score for vehicle-related incidents
                await driverScoreService_1.driverScoreService.processIncidentReport({
                    ...report,
                    ownerUserId: ownerUserId
                });
            }
            catch (error) {
                console.error('Failed to notify owner or update score:', error);
            }
        }
        // Return sanitized report (always redact license plate in response)
        return {
            id: report.id,
            sessionId: report.session_id,
            licensePlate: '[REDACTED]',
            incidentType: report.incident_type,
            subcategory: report.subcategory,
            latitude: report.latitude,
            longitude: report.longitude,
            description: report.description,
            mediaUrl: report.media_url,
            city: report.city,
            state: report.state,
            timestamp: report.created_at,
        };
    }
    async getUserIncidents(userId, limit = 20, offset = 0) {
        const query = `
      SELECT * FROM user_incidents
      WHERE owner_user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
        const result = await database_1.pool.query(query, [userId, limit, offset]);
        return result.rows;
    }
    async getIncidentById(incidentId, userId) {
        const query = `
      SELECT * FROM user_incidents
      WHERE id = $1 AND owner_user_id = $2
    `;
        const result = await database_1.pool.query(query, [incidentId, userId]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    async markIncidentViewed(incidentId, userId) {
        const query = `
      UPDATE reports
      SET owner_viewed_at = NOW()
      WHERE id = $1 AND owner_user_id = $2 AND owner_viewed_at IS NULL
    `;
        await database_1.pool.query(query, [incidentId, userId]);
    }
    async createDispute(disputeData) {
        const query = `
      INSERT INTO incident_disputes (
        report_id,
        user_id,
        dispute_type,
        description,
        supporting_evidence_urls
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const values = [
            disputeData.reportId,
            disputeData.userId,
            disputeData.disputeType,
            disputeData.description,
            disputeData.supportingEvidenceUrls || []
        ];
        const result = await database_1.pool.query(query, values);
        // Update incident status
        await database_1.pool.query('UPDATE reports SET incident_status = $1 WHERE id = $2', ['disputed', disputeData.reportId]);
        return result.rows[0];
    }
    async getDispute(disputeId, userId) {
        const query = `
      SELECT * FROM incident_disputes
      WHERE id = $1 AND user_id = $2
    `;
        const result = await database_1.pool.query(query, [disputeId, userId]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    async addIncidentNote(noteData) {
        // First check if a note already exists
        const existingQuery = `
      SELECT * FROM incident_notes
      WHERE report_id = $1 AND user_id = $2
    `;
        const existingResult = await database_1.pool.query(existingQuery, [noteData.reportId, noteData.userId]);
        if (existingResult.rows.length > 0) {
            // Update existing note
            const updateQuery = `
        UPDATE incident_notes
        SET note = $1, updated_at = NOW()
        WHERE report_id = $2 AND user_id = $3
        RETURNING *
      `;
            const updateResult = await database_1.pool.query(updateQuery, [
                noteData.note,
                noteData.reportId,
                noteData.userId
            ]);
            return updateResult.rows[0];
        }
        else {
            // Create new note
            const insertQuery = `
        INSERT INTO incident_notes (report_id, user_id, note)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
            const insertResult = await database_1.pool.query(insertQuery, [
                noteData.reportId,
                noteData.userId,
                noteData.note
            ]);
            return insertResult.rows[0];
        }
    }
    async getIncidentStats(userId) {
        const query = `
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(*) FILTER (WHERE incident_status = 'active') as active_incidents,
        COUNT(*) FILTER (WHERE incident_status = 'disputed') as disputed_incidents,
        COUNT(*) FILTER (WHERE incident_status = 'resolved') as resolved_incidents,
        COUNT(*) FILTER (WHERE owner_viewed_at IS NULL) as unviewed_incidents
      FROM reports
      WHERE owner_user_id = $1
    `;
        const result = await database_1.pool.query(query, [userId]);
        const stats = result.rows[0];
        return {
            totalIncidents: parseInt(stats.total_incidents) || 0,
            activeIncidents: parseInt(stats.active_incidents) || 0,
            disputedIncidents: parseInt(stats.disputed_incidents) || 0,
            resolvedIncidents: parseInt(stats.resolved_incidents) || 0,
            unviewedIncidents: parseInt(stats.unviewed_incidents) || 0
        };
    }
}
exports.IncidentService = IncidentService;
exports.incidentService = new IncidentService();

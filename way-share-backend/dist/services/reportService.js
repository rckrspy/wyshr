"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = exports.ReportService = void 0;
const database_1 = require("./database");
const anonymization_1 = require("../utils/anonymization");
class ReportService {
    async createReport(data) {
        const query = `
      INSERT INTO reports (
        session_id,
        license_plate_hash,
        incident_type,
        subcategory,
        location,
        rounded_location,
        description,
        media_url,
        city,
        state
      ) VALUES (
        $1, $2, $3, $4,
        ST_SetSRID(ST_MakePoint($5, $6), 4326),
        round_coordinates($6, $5),
        $7, $8, $9, $10
      )
      RETURNING 
        id,
        session_id,
        license_plate_hash,
        incident_type,
        subcategory,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude,
        description,
        media_url,
        city,
        state,
        created_at
    `;
        const values = [
            data.sessionId,
            data.licensePlate ? anonymization_1.AnonymizationService.hashLicensePlate(data.licensePlate) : null,
            data.incidentType,
            data.subcategory || null,
            data.longitude,
            data.latitude,
            data.description || null,
            data.mediaUrl || null,
            data.city || 'San Jose',
            data.state || 'CA',
        ];
        const rows = await database_1.db.query(query, values);
        const row = rows[0];
        return {
            id: row.id,
            sessionId: row.session_id,
            licensePlate: '[REDACTED]',
            incidentType: row.incident_type,
            latitude: row.latitude,
            longitude: row.longitude,
            description: row.description,
            mediaUrl: row.media_url,
            city: row.city,
            state: row.state,
            timestamp: row.created_at,
        };
    }
    async getReports(limit = 100) {
        const query = `
      SELECT 
        id,
        session_id,
        incident_type,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude,
        description,
        media_url,
        city,
        state,
        created_at
      FROM reports
      ORDER BY created_at DESC
      LIMIT $1
    `;
        const rows = await database_1.db.query(query, [limit]);
        return rows.map((row) => ({
            id: row.id,
            sessionId: row.session_id,
            licensePlate: '[REDACTED]',
            incidentType: row.incident_type,
            latitude: row.latitude,
            longitude: row.longitude,
            description: row.description,
            mediaUrl: row.media_url,
            city: row.city,
            state: row.state,
            timestamp: row.created_at,
        }));
    }
    async getReportById(id) {
        const query = `
      SELECT 
        id,
        session_id,
        incident_type,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude,
        description,
        media_url,
        city,
        state,
        created_at
      FROM reports
      WHERE id = $1
    `;
        const rows = await database_1.db.query(query, [id]);
        if (rows.length === 0) {
            return null;
        }
        const row = rows[0];
        return {
            id: row.id,
            sessionId: row.session_id,
            licensePlate: '[REDACTED]',
            incidentType: row.incident_type,
            latitude: row.latitude,
            longitude: row.longitude,
            description: row.description,
            mediaUrl: row.media_url,
            city: row.city,
            state: row.state,
            timestamp: row.created_at,
        };
    }
    async getReportsByLicensePlate(licensePlate) {
        const hashedPlate = anonymization_1.AnonymizationService.hashLicensePlate(licensePlate);
        const query = `
      SELECT 
        id,
        session_id,
        incident_type,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude,
        description,
        media_url,
        city,
        state,
        created_at
      FROM reports
      WHERE license_plate_hash = $1
      ORDER BY created_at DESC
    `;
        const rows = await database_1.db.query(query, [hashedPlate]);
        return rows.map((row) => ({
            id: row.id,
            sessionId: row.session_id,
            licensePlate: '[REDACTED]',
            incidentType: row.incident_type,
            latitude: row.latitude,
            longitude: row.longitude,
            description: row.description,
            mediaUrl: row.media_url,
            city: row.city,
            state: row.state,
            timestamp: row.created_at,
        }));
    }
    async getReportsNearLocation(latitude, longitude, radiusMeters = 1000) {
        const query = `
      SELECT 
        id,
        session_id,
        incident_type,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude,
        description,
        media_url,
        city,
        state,
        created_at,
        ST_Distance(location, ST_SetSRID(ST_MakePoint($2, $1), 4326)) as distance
      FROM reports
      WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint($2, $1), 4326),
        $3
      )
      ORDER BY distance ASC, created_at DESC
      LIMIT 100
    `;
        const rows = await database_1.db.query(query, [latitude, longitude, radiusMeters]);
        return rows.map((row) => ({
            id: row.id,
            sessionId: row.session_id,
            licensePlate: '[REDACTED]',
            incidentType: row.incident_type,
            latitude: row.latitude,
            longitude: row.longitude,
            description: row.description,
            mediaUrl: row.media_url,
            city: row.city,
            state: row.state,
            timestamp: row.created_at,
        }));
    }
    async deleteReport(id, sessionId) {
        const query = `
      DELETE FROM reports
      WHERE id = $1 AND session_id = $2
    `;
        const result = await database_1.db.query(query, [id, sessionId]);
        return result.length > 0;
    }
}
exports.ReportService = ReportService;
exports.reportService = new ReportService();

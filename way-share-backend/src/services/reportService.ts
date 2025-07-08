import { db } from './database';
import { Report, CreateReportDto } from '../types';
import { AnonymizationService } from '../utils/anonymization';

export class ReportService {
  async createReport(data: CreateReportDto): Promise<Report> {
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
      data.licensePlate ? AnonymizationService.hashLicensePlate(data.licensePlate) : null,
      data.incidentType,
      data.subcategory || null,
      data.longitude,
      data.latitude,
      data.description || null,
      data.mediaUrl || null,
      data.city || 'San Jose',
      data.state || 'CA',
    ];

    const rows = await db.query<any>(query, values);
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

  async getReports(limit: number = 100): Promise<Report[]> {
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

    const rows = await db.query<any>(query, [limit]);

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

  async getReportById(id: string): Promise<Report | null> {
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

    const rows = await db.query<any>(query, [id]);

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

  async getReportsByLicensePlate(licensePlate: string): Promise<Report[]> {
    const hashedPlate = AnonymizationService.hashLicensePlate(licensePlate);
    
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

    const rows = await db.query<any>(query, [hashedPlate]);

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

  async getReportsNearLocation(
    latitude: number,
    longitude: number,
    radiusMeters: number = 1000
  ): Promise<Report[]> {
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

    const rows = await db.query<any>(query, [latitude, longitude, radiusMeters]);

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

  async deleteReport(id: string, sessionId: string): Promise<boolean> {
    const query = `
      DELETE FROM reports
      WHERE id = $1 AND session_id = $2
    `;

    const result = await db.query(query, [id, sessionId]);
    return result.length > 0;
  }
}

export const reportService = new ReportService();
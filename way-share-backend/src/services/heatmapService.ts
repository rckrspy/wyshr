import { db } from './database';
import { HeatMapData, IncidentType } from '../types';

export class HeatmapService {
  async getHeatMapData(
    timeRange: string = '24h',
    incidentType?: string
  ): Promise<{
    points: HeatMapData[];
    totalReports: number;
    timeRange: string;
    lastUpdated: string;
  }> {
    // Convert time range to PostgreSQL interval
    let interval: string;
    switch (timeRange) {
      case '7d':
        interval = '7 days';
        break;
      case '30d':
        interval = '30 days';
        break;
      case '24h':
      default:
        interval = '24 hours';
    }

    // Use the database function to get heat map data
    const query = `
      SELECT * FROM get_heatmap_data($1::interval, $2::incident_type)
    `;

    const rows = await db.query<{
      lat: number;
      lng: number;
      count: string;
      incident_types: Record<string, number>;
    }>(query, [interval, incidentType || null]);

    // Convert results to HeatMapData format
    const points: HeatMapData[] = rows.map((row) => ({
      lat: row.lat,
      lng: row.lng,
      count: parseInt(row.count),
      incidentTypes: row.incident_types || {},
    }));

    // Get total report count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reports
      WHERE created_at > NOW() - $1::interval
      ${incidentType ? 'AND incident_type = $2::incident_type' : ''}
    `;

    const countResult = await db.query<{ total: string }>(
      countQuery,
      incidentType ? [interval, incidentType] : [interval]
    );
    const totalReports = parseInt(countResult[0]?.total || '0');

    return {
      points: points.sort((a, b) => b.count - a.count),
      totalReports,
      timeRange,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getIncidentStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    lastUpdated: string;
  }> {
    const query = `
      SELECT 
        incident_type,
        COUNT(*) as count
      FROM reports
      GROUP BY incident_type
    `;

    const rows = await db.query<{
      incident_type: string;
      count: string;
    }>(query);

    // Initialize stats with all incident types
    const stats: Record<string, number> = Object.values(IncidentType).reduce(
      (acc, type) => ({
        ...acc,
        [type]: 0,
      }),
      {}
    );

    // Fill in actual counts
    let total = 0;
    rows.forEach((row) => {
      const count = parseInt(row.count);
      stats[row.incident_type] = count;
      total += count;
    });

    return {
      total,
      byType: stats,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getHeatMapTiles(
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    },
    zoom: number
  ): Promise<HeatMapData[]> {
    // For high zoom levels, return individual points
    // For low zoom levels, aggregate more aggressively
    const aggregationLevel = zoom < 10 ? 0.01 : zoom < 14 ? 0.005 : 0.001;

    const query = `
      SELECT 
        ROUND(ST_Y(rounded_location::geometry) / $5) * $5 as lat,
        ROUND(ST_X(rounded_location::geometry) / $5) * $5 as lng,
        COUNT(*) as count,
        jsonb_object_agg(incident_type::text, incident_count) AS incident_types
      FROM (
        SELECT 
          rounded_location,
          incident_type,
          COUNT(*) AS incident_count
        FROM reports
        WHERE 
          ST_Y(rounded_location::geometry) BETWEEN $1 AND $2
          AND ST_X(rounded_location::geometry) BETWEEN $3 AND $4
          AND created_at > NOW() - INTERVAL '30 days'
        GROUP BY rounded_location, incident_type
      ) r
      GROUP BY 
        ROUND(ST_Y(rounded_location::geometry) / $5) * $5,
        ROUND(ST_X(rounded_location::geometry) / $5) * $5
    `;

    const rows = await db.query<{
      lat: number;
      lng: number;
      count: string;
      incident_types: Record<string, number>;
    }>(query, [bounds.south, bounds.north, bounds.west, bounds.east, aggregationLevel]);

    return rows.map((row) => ({
      lat: row.lat,
      lng: row.lng,
      count: parseInt(row.count),
      incidentTypes: row.incident_types || {},
    }));
  }
}

export const heatmapService = new HeatmapService();
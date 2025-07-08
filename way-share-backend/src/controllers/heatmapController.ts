import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { heatmapService } from '../services/heatmapService';

export const getHeatMapData = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { timeRange = '24h', incidentType } = req.query;

    const data = await heatmapService.getHeatMapData(
      timeRange as string,
      incidentType as string
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getIncidentStats = async (
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const stats = await heatmapService.getIncidentStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getHeatMapTiles = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const north = parseFloat(req.query.north as string);
    const south = parseFloat(req.query.south as string);
    const east = parseFloat(req.query.east as string);
    const west = parseFloat(req.query.west as string);
    const zoom = parseInt(req.query.zoom as string) || 10;

    if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
      res.status(400).json({
        success: false,
        error: 'Invalid map bounds',
      });
      return;
    }

    const points = await heatmapService.getHeatMapTiles(
      { north, south, east, west },
      zoom
    );

    res.json({
      success: true,
      data: {
        points,
        zoom,
        bounds: { north, south, east, west },
      },
    });
  } catch (error) {
    next(error);
  }
};
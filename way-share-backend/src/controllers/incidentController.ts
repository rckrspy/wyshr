import { Request, Response, NextFunction } from 'express';
import { ApiResponse, IncidentTypeMetadata } from '../types';
import { getIncidentTypeMetadata, getIncidentTypesByCategory } from '../utils/incidentTypeHelpers';
import { IncidentType } from '../types';

export const getIncidentTypes = async (
  _req: Request,
  res: Response<ApiResponse<{ vehicle: IncidentTypeMetadata[], location: IncidentTypeMetadata[] }>>,
  _next: NextFunction
) => {
  try {
    const incidentTypes = getIncidentTypesByCategory();
    
    res.json({
      success: true,
      data: incidentTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch incident types',
    });
  }
};

export const getIncidentTypeDetails = async (
  req: Request,
  res: Response<ApiResponse<IncidentTypeMetadata>>,
  _next: NextFunction
) => {
  try {
    const { type } = req.params;
    
    if (!Object.values(IncidentType).includes(type as IncidentType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid incident type',
      });
      return;
    }
    
    const metadata = getIncidentTypeMetadata(type as IncidentType);
    
    if (!metadata) {
      res.status(404).json({
        success: false,
        error: 'Incident type metadata not found',
      });
      return;
    }
    
    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch incident type details',
    });
  }
};
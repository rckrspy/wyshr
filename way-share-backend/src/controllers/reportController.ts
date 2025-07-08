import { Request, Response, NextFunction } from 'express';
import { ApiResponse, CreateReportDto } from '../types';
import { reportService } from '../services/reportService';
import { AnonymizationService } from '../utils/anonymization';

export const submitReport = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { licensePlate, incidentType, subcategory, location, description, mediaUrl } = req.body;

    // Get or create session ID
    let sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
      sessionId = AnonymizationService.generateSessionId();
    }

    // Create report DTO
    const createReportDto: CreateReportDto = {
      sessionId,
      licensePlate, // Optional for location-based hazards
      incidentType,
      subcategory,
      latitude: location.lat,
      longitude: location.lng,
      description: description?.substring(0, 500), // Limit description length
      mediaUrl,
      city: location.city || 'San Jose',
      state: location.state || 'CA',
    };

    // TODO: Handle media upload if present
    if (req.body.media && !mediaUrl) {
      // Process media, strip EXIF, upload to S3
      // createReportDto.mediaUrl = uploadedUrl;
    }

    // Create report in database
    const report = await reportService.createReport(createReportDto);

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        reportId: report.id,
        sessionId,
        message: 'Report submitted successfully',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentReports = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    // This endpoint is for testing only - remove in production
    const limit = parseInt(req.query.limit as string) || 10;
    
    const reports = await reportService.getReports(limit);
    
    const recentReports = reports.map(report => ({
      id: report.id,
      incidentType: report.incidentType,
      location: {
        roundedLat: Math.round(report.latitude * 1000) / 1000,
        roundedLng: Math.round(report.longitude * 1000) / 1000,
      },
      createdAt: report.timestamp,
    }));

    res.json({
      success: true,
      data: recentReports,
    });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const report = await reportService.getReportById(id);
    
    if (!report) {
      res.status(404).json({
        success: false,
        error: 'Report not found',
      });
      return;
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getReportsNearLocation = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const latitude = parseFloat(req.query.lat as string);
    const longitude = parseFloat(req.query.lng as string);
    const radius = parseInt(req.query.radius as string) || 1000;

    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude',
      });
      return;
    }

    const reports = await reportService.getReportsNearLocation(
      latitude,
      longitude,
      radius
    );

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};
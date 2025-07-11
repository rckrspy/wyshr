import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { incidentService } from '../services/incidentService';
import { notificationService } from '../services/notificationService';
import { validationResult } from 'express-validator';

export const userIncidentController = {
  // Get all incidents for the authenticated user
  async getUserIncidents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const incidents = await incidentService.getUserIncidents(userId, limit, offset);
      const stats = await incidentService.getIncidentStats(userId);

      res.json({
        success: true,
        data: {
          incidents,
          stats,
          pagination: {
            limit,
            offset,
            total: stats.totalIncidents
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user incidents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch incidents'
      });
    }
  },

  // Get a specific incident
  async getIncident(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      const incident = await incidentService.getIncidentById(id, userId);

      if (!incident) {
        res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
        return;
      }

      res.json({
        success: true,
        data: incident
      });
    } catch (error) {
      console.error('Error fetching incident:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch incident'
      });
    }
  },

  // Mark incident as viewed
  async markViewed(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      await incidentService.markIncidentViewed(id, userId);

      res.json({
        success: true,
        message: 'Incident marked as viewed'
      });
    } catch (error) {
      console.error('Error marking incident as viewed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark incident as viewed'
      });
    }
  },

  // Create a dispute
  async createDispute(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const userId = req.userId!;
      const { disputeType, description, supportingEvidenceUrls } = req.body;

      // Verify the incident belongs to the user
      const incident = await incidentService.getIncidentById(id, userId);
      if (!incident) {
        res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
        return;
      }

      // Check if dispute already exists
      if (incident.dispute_id) {
        res.status(400).json({
          success: false,
          error: 'A dispute has already been filed for this incident'
        });
        return;
      }

      const dispute = await incidentService.createDispute({
        reportId: id,
        userId,
        disputeType,
        description,
        supportingEvidenceUrls
      });

      res.json({
        success: true,
        data: dispute,
        message: 'Dispute created successfully'
      });
    } catch (error) {
      console.error('Error creating dispute:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create dispute'
      });
    }
  },

  // Add or update incident note
  async updateNote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const userId = req.userId!;
      const { note } = req.body;

      // Verify the incident belongs to the user
      const incident = await incidentService.getIncidentById(id, userId);
      if (!incident) {
        res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
        return;
      }

      const incidentNote = await incidentService.addIncidentNote({
        reportId: id,
        userId,
        note
      });

      res.json({
        success: true,
        data: incidentNote,
        message: 'Note updated successfully'
      });
    } catch (error) {
      console.error('Error updating incident note:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update note'
      });
    }
  },

  // Get notifications
  async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const notifications = await notificationService.getUserNotifications(userId, limit, offset);
      const unreadCount = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
          pagination: {
            limit,
            offset
          }
        }
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notifications'
      });
    }
  },

  // Mark notification as read
  async markNotificationRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      await notificationService.markAsRead(id, userId);

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read'
      });
    }
  },

  // Mark all notifications as read
  async markAllNotificationsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;

      await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notifications as read'
      });
    }
  },

  // Get notification preferences
  async getNotificationPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;

      const preferences = await notificationService.getNotificationPreferences(userId);

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notification preferences'
      });
    }
  },

  // Update notification preferences
  async updateNotificationPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const preferences = req.body;

      const updatedPreferences = await notificationService.updatePreferences(userId, preferences);

      res.json({
        success: true,
        data: updatedPreferences,
        message: 'Notification preferences updated successfully'
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update notification preferences'
      });
    }
  }
};
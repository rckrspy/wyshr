import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { adminService } from '../services/adminService';
import { vehicleVerificationService } from '../services/vehicleVerificationService';
import { uploadService } from '../services/uploadService';

export const getPendingVerifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check admin access
    const adminUser = await adminService.getAdminUser(req.userId);
    if (!adminUser || !adminUser.is_active) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { type, limit = 50, offset = 0 } = req.query;
    
    const pendingReviews = await adminService.getPendingReviews(
      type as 'vehicle_verification' | 'identity_verification' | undefined,
      Number(limit),
      Number(offset)
    );

    // Get signed URLs for documents
    const reviewsWithUrls = await Promise.all(
      pendingReviews.map(async (review) => {
        if (review.document_url) {
          const signedUrl = await uploadService.getSignedUrl(review.document_url);
          return { ...review, document_url: signedUrl };
        }
        return review;
      })
    );

    res.json({
      reviews: reviewsWithUrls,
      total: reviewsWithUrls.length
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({ error: 'Failed to get pending verifications' });
  }
};

export const getVerificationDetails = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check admin access
    const adminUser = await adminService.getAdminUser(req.userId);
    if (!adminUser || !adminUser.is_active) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const { type } = req.query;

    if (!type) {
      res.status(400).json({ error: 'Verification type required' });
      return;
    }

    const details = await adminService.getReviewDetails(type as string, id);
    
    if (!details) {
      res.status(404).json({ error: 'Verification not found' });
      return;
    }

    // Get signed URL for document
    if (details.document_url && typeof details.document_url === 'string') {
      details.document_url = await uploadService.getSignedUrl(details.document_url);
    }

    // Get review history
    const history = await adminService.getReviewHistory(type as string, id);

    res.json({
      verification: details,
      history
    });
  } catch (error) {
    console.error('Get verification details error:', error);
    res.status(500).json({ error: 'Failed to get verification details' });
  }
};

export const submitReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check admin access
    const adminUser = await adminService.getAdminUser(req.userId);
    if (!adminUser || !adminUser.is_active) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const { type, action, notes } = req.body;

    if (!type || !action) {
      res.status(400).json({ error: 'Type and action are required' });
      return;
    }

    // Validate action
    const validActions = ['approved', 'rejected', 'requested_info', 'escalated'];
    if (!validActions.includes(action)) {
      res.status(400).json({ error: 'Invalid action' });
      return;
    }

    // Log admin activity
    await adminService.logActivity(
      adminUser.id,
      'review_submitted',
      type,
      id,
      { action, notes }
    );

    // Submit the review
    const reviewLog = await adminService.submitReview(
      adminUser.id,
      type as 'vehicle_verification' | 'identity_verification' | 'incident_dispute',
      id,
      action as 'approved' | 'rejected' | 'requested_info' | 'escalated',
      notes
    );

    // Handle specific actions based on type
    if (type === 'vehicle_verification') {
      await vehicleVerificationService.submitReview(
        id,
        req.userId!, // Use the actual user ID, not the admin_users table ID
        action === 'approved' ? 'approved' : 'rejected',
        notes
      );
    }

    res.json({
      message: 'Review submitted successfully',
      review: reviewLog
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

export const getAdminStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check admin access
    const adminUser = await adminService.getAdminUser(req.userId);
    if (!adminUser || !adminUser.is_active) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const stats = await adminService.getAdminStats(
      adminUser.role === 'reviewer' ? adminUser.id : undefined
    );

    res.json({ stats });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get admin statistics' });
  }
};

export const getAdminUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check admin access (only full admins can view other admins)
    const adminUser = await adminService.getAdminUser(req.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      res.status(403).json({ error: 'Admin role required' });
      return;
    }

    const admins = await adminService.getAdminUsers();

    res.json({ admins });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Failed to get admin users' });
  }
};

export const createAdminUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check admin access (only full admins can create other admins)
    const adminUser = await adminService.getAdminUser(req.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      res.status(403).json({ error: 'Admin role required' });
      return;
    }

    const { userId, role, permissions } = req.body;

    if (!userId || !role) {
      res.status(400).json({ error: 'User ID and role are required' });
      return;
    }

    const newAdmin = await adminService.createAdminUser(
      userId,
      role,
      permissions || {},
      adminUser.id
    );

    await adminService.logActivity(
      adminUser.id,
      'admin_user_created',
      'admin_users',
      newAdmin.id,
      { role, permissions }
    );

    res.status(201).json({
      message: 'Admin user created successfully',
      admin: newAdmin
    });
  } catch (error) {
    console.error('Create admin user error:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
};

export const updateAdminStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check admin access (only full admins can update status)
    const adminUser = await adminService.getAdminUser(req.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      res.status(403).json({ error: 'Admin role required' });
      return;
    }

    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({ error: 'isActive must be a boolean' });
      return;
    }

    // Prevent self-deactivation
    if (id === adminUser.id && !isActive) {
      res.status(400).json({ error: 'Cannot deactivate your own admin account' });
      return;
    }

    await adminService.updateAdminStatus(id, isActive);

    await adminService.logActivity(
      adminUser.id,
      isActive ? 'admin_user_activated' : 'admin_user_deactivated',
      'admin_users',
      id
    );

    res.json({
      message: `Admin user ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({ error: 'Failed to update admin status' });
  }
};

export const getActivityLogs = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check admin access
    const adminUser = await adminService.getAdminUser(req.userId);
    if (!adminUser || !adminUser.is_active) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { limit = 100, offset = 0 } = req.query;
    
    // Reviewers can only see their own logs
    const adminId = adminUser.role === 'reviewer' ? adminUser.id : undefined;
    
    const logs = await adminService.getActivityLogs(
      adminId,
      Number(limit),
      Number(offset)
    );

    res.json({ logs });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Failed to get activity logs' });
  }
};
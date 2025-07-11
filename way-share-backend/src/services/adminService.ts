import { pool } from './database';

interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'reviewer';
  permissions: Record<string, boolean | string>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ReviewLog {
  id: string;
  reviewer_id: string;
  entity_type: 'vehicle_verification' | 'identity_verification' | 'incident_dispute';
  entity_id: string;
  action: 'approved' | 'rejected' | 'requested_info' | 'escalated';
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
}

interface PendingReview {
  review_type: string;
  entity_id: string;
  created_at: Date;
  user_email: string;
  license_plate?: string;
  state?: string;
  owner_name?: string;
  document_url?: string;
  extraction_confidence?: number;
  extracted_data?: Record<string, unknown>;
}

class AdminService {
  /**
   * Check if a user is an admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT id, role, is_active FROM admin_users WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return false;
    }
    
    const admin = result.rows[0];
    return admin.is_active && (admin.role === 'admin' || admin.role === 'reviewer');
  }

  /**
   * Get admin user details
   */
  async getAdminUser(userId: string): Promise<AdminUser | null> {
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE user_id = $1',
      [userId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Check if admin has specific permission
   */
  async hasPermission(adminId: string, permission: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT check_admin_permission($1, $2) as has_permission',
      [adminId, permission]
    );
    
    return result.rows[0]?.has_permission || false;
  }

  /**
   * Get pending reviews
   */
  async getPendingReviews(
    reviewType?: 'vehicle_verification' | 'identity_verification',
    limit: number = 50,
    offset: number = 0
  ): Promise<PendingReview[]> {
    let query = `
      SELECT 
        'vehicle_verification' as review_type,
        vv.id as entity_id,
        vv.created_at,
        u.email as user_email,
        veh.license_plate,
        veh.state,
        iv.verified_name as owner_name,
        vv.document_url,
        vv.extraction_confidence,
        vv.extracted_data
      FROM vehicle_verifications vv
      JOIN verified_vehicles veh ON vv.vehicle_id = veh.id
      JOIN users u ON veh.user_id = u.id
      LEFT JOIN identity_verifications iv ON u.identity_verification_id = iv.id
      WHERE vv.manual_review_required = true 
      AND vv.status = 'pending'
    `;
    
    if (reviewType) {
      query += ` AND 'vehicle_verification' = $1`;
    }
    
    query += ` ORDER BY vv.created_at ASC LIMIT ${limit} OFFSET ${offset}`;
    
    const result = reviewType 
      ? await pool.query(query, [reviewType])
      : await pool.query(query);
    return result.rows;
  }

  /**
   * Get review details
   */
  async getReviewDetails(entityType: string, entityId: string): Promise<Record<string, unknown> | null> {
    if (entityType === 'vehicle_verification') {
      const result = await pool.query(
        `SELECT 
          vv.*,
          veh.license_plate,
          veh.state,
          veh.make,
          veh.model,
          veh.year,
          veh.color,
          u.email as user_email,
          iv.verified_name as identity_verified_name,
          iv.status as identity_status
        FROM vehicle_verifications vv
        JOIN verified_vehicles veh ON vv.vehicle_id = veh.id
        JOIN users u ON veh.user_id = u.id
        LEFT JOIN identity_verifications iv ON u.identity_verification_id = iv.id
        WHERE vv.id = $1`,
        [entityId]
      );
      
      return result.rows[0];
    }
    
    // Add other entity types as needed
    return null;
  }

  /**
   * Submit review decision
   */
  async submitReview(
    adminId: string,
    entityType: 'vehicle_verification' | 'identity_verification' | 'incident_dispute',
    entityId: string,
    action: 'approved' | 'rejected' | 'requested_info' | 'escalated',
    notes?: string,
    metadata?: Record<string, unknown>
  ): Promise<ReviewLog> {
    // Log the review
    const result = await pool.query(
      `INSERT INTO review_logs 
       (reviewer_id, entity_type, entity_id, action, notes, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [adminId, entityType, entityId, action, notes, metadata || {}]
    );
    
    const reviewLog = result.rows[0];
    
    // Log admin activity
    await this.logActivity(
      adminId,
      `${entityType}_${action}`,
      entityType,
      entityId,
      { notes, ...metadata }
    );
    
    return reviewLog;
  }

  /**
   * Get review history for an entity
   */
  async getReviewHistory(entityType: string, entityId: string): Promise<ReviewLog[]> {
    const result = await pool.query(
      `SELECT 
        rl.*,
        au.role as reviewer_role,
        u.email as reviewer_email
       FROM review_logs rl
       JOIN admin_users au ON rl.reviewer_id = au.id
       JOIN users u ON au.user_id = u.id
       WHERE rl.entity_type = $1 AND rl.entity_id = $2
       ORDER BY rl.created_at DESC`,
      [entityType, entityId]
    );
    
    return result.rows;
  }

  /**
   * Get admin statistics
   */
  async getAdminStats(adminId?: string): Promise<{
    approved_count: number;
    rejected_count: number;
    last_24h_count: number;
    last_7d_count: number;
    total_reviews: number;
    pending_count: number;
  }> {
    const baseQuery = adminId 
      ? 'WHERE reviewer_id = $1' 
      : '';
    
    const params = adminId ? [adminId] : [];
    
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE action = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE action = 'rejected') as rejected_count,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h_count,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d_count,
        COUNT(*) as total_reviews
       FROM review_logs
       ${baseQuery}`,
      params
    );
    
    const pendingResult = await pool.query(
      `SELECT COUNT(*) as pending_count
       FROM vehicle_verifications
       WHERE manual_review_required = true AND status = 'pending'`
    );
    
    return {
      ...statsResult.rows[0],
      pending_count: pendingResult.rows[0].pending_count
    };
  }

  /**
   * Create or update admin user
   */
  async createAdminUser(
    userId: string,
    role: 'admin' | 'reviewer',
    permissions: Record<string, boolean | string> = {},
    createdBy?: string
  ): Promise<AdminUser> {
    const result = await pool.query(
      `INSERT INTO admin_users (user_id, role, permissions, created_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) 
       DO UPDATE SET role = $2, permissions = $3, updated_at = NOW()
       RETURNING *`,
      [userId, role, permissions, createdBy]
    );
    
    return result.rows[0];
  }

  /**
   * Update admin status
   */
  async updateAdminStatus(adminId: string, isActive: boolean): Promise<void> {
    await pool.query(
      'UPDATE admin_users SET is_active = $1, updated_at = NOW() WHERE id = $2',
      [isActive, adminId]
    );
  }

  /**
   * Get all admin users
   */
  async getAdminUsers(): Promise<Array<AdminUser & { email: string; review_count: number }>> {
    const result = await pool.query(
      `SELECT 
        au.*,
        u.email,
        (SELECT COUNT(*) FROM review_logs WHERE reviewer_id = au.id) as review_count
       FROM admin_users au
       JOIN users u ON au.user_id = u.id
       ORDER BY au.created_at DESC`
    );
    
    return result.rows;
  }

  /**
   * Log admin activity
   */
  async logActivity(
    adminId: string,
    actionType: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await pool.query(
      'SELECT log_admin_activity($1, $2, $3, $4, $5)',
      [adminId, actionType, resourceType, resourceId, metadata || {}]
    );
  }

  /**
   * Get admin activity logs
   */
  async getActivityLogs(
    adminId?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<Array<{
    id: string;
    admin_id: string;
    action_type: string;
    resource_type?: string;
    resource_id?: string;
    metadata?: Record<string, unknown>;
    created_at: Date;
    role: string;
    email: string;
  }>> {
    let query = `
      SELECT 
        aal.*,
        au.role,
        u.email
       FROM admin_activity_logs aal
       JOIN admin_users au ON aal.admin_id = au.id
       JOIN users u ON au.user_id = u.id
    `;
    
    if (adminId) {
      query += ' WHERE aal.admin_id = $1';
    }
    
    query += ' ORDER BY aal.created_at DESC LIMIT $2 OFFSET $3';
    
    const params = adminId ? [adminId, limit, offset] : [limit, offset];
    const result = await pool.query(query, params);
    
    return result.rows;
  }
}

export const adminService = new AdminService();
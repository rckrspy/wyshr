"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const database_1 = require("./database");
const emailService_1 = require("./emailService"); // We'll need to implement this
const pushService_1 = require("./pushService"); // We'll need to implement this
class NotificationService {
    async createNotification(data) {
        const query = `
      INSERT INTO notifications (user_id, report_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
        const values = [
            data.userId,
            data.reportId || null,
            data.type,
            data.title,
            data.message,
            data.data ? JSON.stringify(data.data) : null
        ];
        const result = await database_1.pool.query(query, values);
        return result.rows[0];
    }
    async getNotificationPreferences(userId) {
        const query = `
      SELECT * FROM notification_preferences
      WHERE user_id = $1`;
        const result = await database_1.pool.query(query, [userId]);
        if (result.rows.length === 0) {
            // Create default preferences if none exist
            const insertQuery = `
        INSERT INTO notification_preferences (user_id)
        VALUES ($1)
        RETURNING *`;
            const insertResult = await database_1.pool.query(insertQuery, [userId]);
            return insertResult.rows[0];
        }
        return result.rows[0];
    }
    async sendNotification(notification) {
        const preferences = await this.getNotificationPreferences(notification.user_id);
        // Determine which channels to use based on notification type and preferences
        const shouldSendEmail = this.shouldSendEmail(notification.type, preferences);
        const shouldSendPush = this.shouldSendPush(notification.type, preferences);
        const promises = [];
        if (shouldSendEmail) {
            promises.push(this.sendEmailNotification(notification));
        }
        if (shouldSendPush) {
            promises.push(this.sendPushNotification(notification));
        }
        await Promise.allSettled(promises);
    }
    shouldSendEmail(type, preferences) {
        switch (type) {
            case 'incident_reported':
                return preferences.email_incidents;
            case 'dispute_resolved':
            case 'dispute_rejected':
                return preferences.email_disputes;
            case 'vehicle_verified':
                return preferences.email_vehicle_updates;
            default:
                return false;
        }
    }
    shouldSendPush(type, preferences) {
        switch (type) {
            case 'incident_reported':
                return preferences.push_incidents;
            case 'dispute_resolved':
            case 'dispute_rejected':
                return preferences.push_disputes;
            case 'vehicle_verified':
                return preferences.push_vehicle_updates;
            default:
                return false;
        }
    }
    async sendEmailNotification(notification) {
        try {
            // Get user email
            const userQuery = 'SELECT email FROM users WHERE id = $1';
            const userResult = await database_1.pool.query(userQuery, [notification.user_id]);
            if (userResult.rows.length === 0) {
                throw new Error('User not found');
            }
            const userEmail = userResult.rows[0].email;
            // Send email (this will be implemented in emailService.ts)
            await (0, emailService_1.sendEmail)({
                to: userEmail,
                subject: notification.title,
                text: notification.message,
                html: this.formatEmailHtml(notification)
            });
            // Update notification record
            const updateQuery = `
        UPDATE notifications 
        SET email_sent = true, email_sent_at = NOW()
        WHERE id = $1`;
            await database_1.pool.query(updateQuery, [notification.id]);
        }
        catch (error) {
            console.error('Failed to send email notification:', error);
        }
    }
    async sendPushNotification(notification) {
        try {
            // Get user's push tokens (to be implemented)
            // For now, this is a placeholder
            // Send push notification (this will be implemented in pushService.ts)
            await (0, pushService_1.sendPushNotification)({
                userId: notification.user_id,
                title: notification.title,
                body: notification.message,
                data: notification.data
            });
            // Update notification record
            const updateQuery = `
        UPDATE notifications 
        SET push_sent = true, push_sent_at = NOW()
        WHERE id = $1`;
            await database_1.pool.query(updateQuery, [notification.id]);
        }
        catch (error) {
            console.error('Failed to send push notification:', error);
        }
    }
    formatEmailHtml(notification) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f5f5f5; }
          .button { display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Way-Share</h1>
          </div>
          <div class="content">
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
            <a href="${process.env.FRONTEND_URL}/dashboard/incidents" class="button">View in Way-Share</a>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    async notifyOwner(report) {
        if (!report.owner_user_id) {
            return;
        }
        const notification = await this.createNotification({
            userId: report.owner_user_id,
            reportId: report.id,
            type: 'incident_reported',
            title: 'New Incident Reported',
            message: `A new ${report.incident_type} incident has been reported for your vehicle ${report.license_plate_plaintext}.`,
            data: {
                incidentType: report.incident_type,
                licensePlate: report.license_plate_plaintext,
                location: report.location,
                timestamp: report.created_at
            }
        });
        await this.sendNotification(notification);
    }
    async getUserNotifications(userId, limit = 20, offset = 0) {
        const query = `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`;
        const result = await database_1.pool.query(query, [userId, limit, offset]);
        return result.rows;
    }
    async markAsRead(notificationId, userId) {
        const query = `
      UPDATE notifications
      SET is_read = true, read_at = NOW()
      WHERE id = $1 AND user_id = $2`;
        await database_1.pool.query(query, [notificationId, userId]);
    }
    async markAllAsRead(userId) {
        const query = `
      UPDATE notifications
      SET is_read = true, read_at = NOW()
      WHERE user_id = $1 AND is_read = false`;
        await database_1.pool.query(query, [userId]);
    }
    async getUnreadCount(userId) {
        const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND is_read = false`;
        const result = await database_1.pool.query(query, [userId]);
        return parseInt(result.rows[0].count);
    }
    async updatePreferences(userId, preferences) {
        const allowedFields = [
            'email_incidents',
            'push_incidents',
            'email_disputes',
            'push_disputes',
            'email_vehicle_updates',
            'push_vehicle_updates'
        ];
        const updates = [];
        const values = [userId];
        let paramIndex = 2;
        for (const [key, value] of Object.entries(preferences)) {
            if (allowedFields.includes(key) && typeof value === 'boolean') {
                updates.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }
        if (updates.length === 0) {
            return this.getNotificationPreferences(userId);
        }
        const query = `
      UPDATE notification_preferences
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE user_id = $1
      RETURNING *`;
        const result = await database_1.pool.query(query, values);
        return result.rows[0];
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();

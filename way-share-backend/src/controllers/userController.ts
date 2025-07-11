import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import pool from '../services/database';

export class UserController {
  /**
   * Get user profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await pool.query(
        `SELECT id, email, email_verified, created_at, updated_at 
         FROM users 
         WHERE id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: result.rows[0],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // For now, only email can be updated
      const { email } = req.body;

      if (email) {
        // Check if email is already taken
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email, req.user.id]
        );

        if (existingUser.rows.length > 0) {
          res.status(400).json({
            success: false,
            message: 'Email already in use',
          });
          return;
        }

        // Update email (will require re-verification)
        await pool.query(
          `UPDATE users 
           SET email = $1, 
               email_verified = false,
               updated_at = NOW()
           WHERE id = $2`,
          [email, req.user.id]
        );

        // TODO: Send new verification email
      }

      // Get updated user
      const result = await pool.query(
        `SELECT id, email, email_verified, created_at, updated_at 
         FROM users 
         WHERE id = $1`,
        [req.user.id]
      );

      res.json({
        success: true,
        data: {
          user: result.rows[0],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Verify password before deletion
      const { password } = req.body;
      if (!password) {
        res.status(400).json({
          success: false,
          message: 'Password required for account deletion',
        });
        return;
      }

      // Import authService to verify password
      const { authService } = await import('../services/authService');
      
      // Get user with password
      const userResult = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const isValidPassword = await authService.verifyPassword(
        password,
        userResult.rows[0].password_hash
      );

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid password',
        });
        return;
      }

      // Delete user (will cascade to sessions and other related data)
      await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
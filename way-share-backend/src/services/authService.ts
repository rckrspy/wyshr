import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from './database';
import { config } from '../config/config';

interface User {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';
  private readonly emailVerificationExpiry = 24 * 60 * 60 * 1000; // 24 hours
  private readonly passwordResetExpiry = 60 * 60 * 1000; // 1 hour

  /**
   * Hash password using Argon2
   */
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  /**
   * Generate JWT tokens
   */
  async generateTokens(userId: string, email: string): Promise<AuthTokens> {
    const accessToken = jwt.sign(
      { userId, email, type: 'access' } as TokenPayload,
      config.jwtSecret,
      { expiresIn: this.accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      { userId, email, type: 'refresh' } as TokenPayload,
      config.jwtSecret,
      { expiresIn: this.refreshTokenExpiry }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  }

  /**
   * Register new user
   */
  async register(email: string, password: string): Promise<User> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User already exists');
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date(Date.now() + this.emailVerificationExpiry);

      // Create user
      const result = await client.query(
        `INSERT INTO users (email, password_hash, email_verification_token, email_verification_expires)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, email_verified, created_at, updated_at`,
        [email, passwordHash, emailVerificationToken, emailVerificationExpires]
      );

      // Log audit event
      await this.logAuthEvent(result.rows[0].id, 'registration', { email });

      await client.query('COMMIT');

      // TODO: Send verification email
      // await emailService.sendVerificationEmail(email, emailVerificationToken);

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string, userAgent?: string, ipAddress?: string): Promise<{ user: User; tokens: AuthTokens }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get user
      const userResult = await client.query(
        `SELECT id, email, password_hash, email_verified, failed_login_attempts, 
                account_locked_until, created_at, updated_at
         FROM users 
         WHERE email = $1`,
        [email]
      );

      if (userResult.rows.length === 0) {
        await this.logAuthEvent(null, 'login_failed', { email, reason: 'user_not_found' });
        throw new Error('Invalid credentials');
      }

      const user = userResult.rows[0];

      // Check if account is locked
      if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
        await this.logAuthEvent(user.id, 'login_failed', { reason: 'account_locked' });
        throw new Error('Account temporarily locked due to multiple failed login attempts');
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        // Increment failed login attempts
        const failedAttempts = user.failed_login_attempts + 1;
        const lockAccount = failedAttempts >= 5;
        
        await client.query(
          `UPDATE users 
           SET failed_login_attempts = $1,
               account_locked_until = $2
           WHERE id = $3`,
          [
            failedAttempts,
            lockAccount ? new Date(Date.now() + 30 * 60 * 1000) : null, // Lock for 30 minutes
            user.id
          ]
        );

        await this.logAuthEvent(user.id, 'login_failed', { reason: 'invalid_password' });
        await client.query('COMMIT');
        throw new Error('Invalid credentials');
      }

      // Reset failed login attempts
      await client.query(
        `UPDATE users 
         SET failed_login_attempts = 0,
             account_locked_until = NULL,
             last_login_at = NOW()
         WHERE id = $1`,
        [user.id]
      );

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email);

      // Create session
      const sessionResult = await client.query(
        `INSERT INTO user_sessions (user_id, refresh_token, user_agent, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          user.id,
          tokens.refreshToken,
          userAgent,
          ipAddress,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        ]
      );

      await this.logAuthEvent(user.id, 'login_success', { sessionId: sessionResult.rows[0].id });
      await client.query('COMMIT');

      return {
        user: {
          id: user.id,
          email: user.email,
          email_verified: user.email_verified,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        tokens
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get session
      const sessionResult = await client.query(
        'SELECT id, user_id FROM user_sessions WHERE refresh_token = $1',
        [refreshToken]
      );

      if (sessionResult.rows.length > 0) {
        const session = sessionResult.rows[0];

        // Revoke session
        await client.query(
          'UPDATE user_sessions SET revoked_at = NOW() WHERE id = $1',
          [session.id]
        );

        await this.logAuthEvent(session.user_id, 'logout', { sessionId: session.id });
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const client = await pool.connect();
    try {
      // Verify refresh token
      const payload = this.verifyToken(refreshToken);
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if session exists and is valid
      const sessionResult = await client.query(
        `SELECT s.id, s.user_id, s.expires_at, s.revoked_at, u.email
         FROM user_sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.refresh_token = $1`,
        [refreshToken]
      );

      if (sessionResult.rows.length === 0) {
        throw new Error('Session not found');
      }

      const session = sessionResult.rows[0];

      // Check if session is revoked
      if (session.revoked_at) {
        throw new Error('Session has been revoked');
      }

      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        throw new Error('Session has expired');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(session.user_id, session.email);

      // Update session with new refresh token
      await client.query(
        'UPDATE user_sessions SET refresh_token = $1 WHERE id = $2',
        [tokens.refreshToken, session.id]
      );

      return tokens;
    } finally {
      client.release();
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE users 
         SET email_verified = true,
             email_verification_token = NULL,
             email_verification_expires = NULL
         WHERE email_verification_token = $1
           AND email_verification_expires > NOW()
         RETURNING id`,
        [token]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired verification token');
      }

      await this.logAuthEvent(result.rows[0].id, 'email_verified', {});
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + this.passwordResetExpiry);

      const result = await client.query(
        `UPDATE users 
         SET password_reset_token = $1,
             password_reset_expires = $2
         WHERE email = $3
         RETURNING id`,
        [resetToken, resetExpires, email]
      );

      if (result.rows.length > 0) {
        await this.logAuthEvent(result.rows[0].id, 'password_reset_requested', {});
        // TODO: Send password reset email
        // await emailService.sendPasswordResetEmail(email, resetToken);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const passwordHash = await this.hashPassword(newPassword);

      const result = await client.query(
        `UPDATE users 
         SET password_hash = $1,
             password_reset_token = NULL,
             password_reset_expires = NULL,
             failed_login_attempts = 0,
             account_locked_until = NULL
         WHERE password_reset_token = $2
           AND password_reset_expires > NOW()
         RETURNING id`,
        [passwordHash, token]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      // Revoke all existing sessions
      await client.query(
        'UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = $1',
        [result.rows[0].id]
      );

      await this.logAuthEvent(result.rows[0].id, 'password_reset_completed', {});
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find user by ID
   */
  async findUserById(userId: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, email, email_verified, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Log authentication event
   */
  private async logAuthEvent(
    userId: string | null,
    eventType: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO auth_audit_log (user_id, event_type, metadata)
         VALUES ($1, $2, $3)`,
        [userId, eventType, JSON.stringify(metadata)]
      );
    } catch (error) {
      console.error('Failed to log auth event:', error);
    }
  }
}

export const authService = new AuthService();
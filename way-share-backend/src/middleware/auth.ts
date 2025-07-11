import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import pool from '../services/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    emailVerified?: boolean;
    identityVerified?: boolean;
  };
  userId?: string; // For backward compatibility
}

interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;

      // Check if it's an access token
      if (decoded.type !== 'access') {
        res.status(401).json({
          success: false,
          message: 'Invalid token type',
        });
        return;
      }

      // Trust JWT payload for basic user info (optimized - no DB query)
      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };
      req.userId = decoded.userId; // For backward compatibility

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
        return;
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: 'Token expired',
        });
        return;
      }

      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to verify user exists in database (for sensitive operations)
 * Use this only when you need to ensure the user still exists and is active
 */
export const authenticateWithUserVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // First run basic authentication
    await authenticate(req, res, () => {});
    
    if (!req.user) {
      return; // authenticate already sent error response
    }

    // Verify user still exists and is active
    const userResult = await pool.query(
      'SELECT id, email, email_verified, identity_verified FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    // Update user info with fresh data from database
    const user = userResult.rows[0];
    req.user = {
      id: user.id,
      email: user.email,
      emailVerified: user.email_verified,
      identityVerified: user.identity_verified,
    };

    next();
  } catch (error) {
    console.error('User verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication verification failed',
    });
  }
};

/**
 * Middleware to require verified email
 */
export const requireVerifiedEmail = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const userResult = await pool.query(
      'SELECT email_verified FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (!userResult.rows[0].email_verified) {
      res.status(403).json({
        success: false,
        message: 'Email verification required',
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - attaches user if token is valid but doesn't require it
 */
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;

      if (decoded.type === 'access') {
        req.user = {
          id: decoded.userId,
          email: decoded.email,
        };
        req.userId = decoded.userId; // For backward compatibility
      }
    } catch {
      // Invalid token, continue without user
      console.log('Optional auth: Invalid token provided');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to require verified identity (for driver score features)
 */
export const requireVerified = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const userResult = await pool.query(
      'SELECT identity_verified FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (!userResult.rows[0].identity_verified) {
      res.status(403).json({
        success: false,
        message: 'Identity verification required',
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Alias for backward compatibility
export const authenticateToken = authenticate;
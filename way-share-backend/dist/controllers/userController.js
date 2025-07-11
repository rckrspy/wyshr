"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const database_1 = __importDefault(require("../services/database"));
class UserController {
    /**
     * Get user profile
     */
    async getProfile(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }
            const result = await database_1.default.query(`SELECT id, email, email_verified, created_at, updated_at 
         FROM users 
         WHERE id = $1`, [req.user.id]);
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
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update user profile
     */
    async updateProfile(req, res, next) {
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
                const existingUser = await database_1.default.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, req.user.id]);
                if (existingUser.rows.length > 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Email already in use',
                    });
                    return;
                }
                // Update email (will require re-verification)
                await database_1.default.query(`UPDATE users 
           SET email = $1, 
               email_verified = false,
               updated_at = NOW()
           WHERE id = $2`, [email, req.user.id]);
                // TODO: Send new verification email
            }
            // Get updated user
            const result = await database_1.default.query(`SELECT id, email, email_verified, created_at, updated_at 
         FROM users 
         WHERE id = $1`, [req.user.id]);
            res.json({
                success: true,
                data: {
                    user: result.rows[0],
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete user account
     */
    async deleteAccount(req, res, next) {
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
            const { authService } = await Promise.resolve().then(() => __importStar(require('../services/authService')));
            // Get user with password
            const userResult = await database_1.default.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
            if (userResult.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            const isValidPassword = await authService.verifyPassword(password, userResult.rows[0].password_hash);
            if (!isValidPassword) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid password',
                });
                return;
            }
            // Delete user (will cascade to sessions and other related data)
            await database_1.default.query('DELETE FROM users WHERE id = $1', [req.user.id]);
            res.json({
                success: true,
                message: 'Account deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonymizationService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config/config");
class AnonymizationService {
    /**
     * Hash a license plate using SHA-256 with salt
     * This is a one-way, irreversible hash for privacy protection
     */
    static hashLicensePlate(licensePlate) {
        if (!licensePlate) {
            throw new Error('License plate is required');
        }
        // Normalize the license plate: uppercase, remove spaces and special characters
        const normalized = licensePlate
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '');
        // Create hash with salt
        const hash = crypto_1.default
            .createHash(config_1.config.anonymization.hashAlgorithm)
            .update(normalized + this.SALT)
            .digest('hex');
        // Return first 16 characters for storage efficiency
        return hash.substring(0, 16);
    }
    /**
     * Generate a session ID for anonymous users
     */
    static generateSessionId() {
        return crypto_1.default.randomBytes(16).toString('hex');
    }
    /**
     * Round coordinates to nearest 100m for privacy
     */
    static roundCoordinates(lat, lng) {
        // 0.001 degrees is approximately 100m
        const precision = 0.001;
        return {
            roundedLat: Math.round(lat / precision) * precision,
            roundedLng: Math.round(lng / precision) * precision,
        };
    }
    /**
     * Strip EXIF data from image buffer
     * Note: In production, use a proper library like piexifjs or sharp
     */
    static async stripExifData(imageBuffer) {
        // TODO: Implement EXIF stripping
        // For MVP, this is a placeholder
        return imageBuffer;
    }
    /**
     * Validate that a string is properly anonymized (hashed)
     */
    static isAnonymized(value) {
        // Check if it matches our hash pattern (16 hex characters)
        return /^[a-f0-9]{16}$/.test(value);
    }
}
exports.AnonymizationService = AnonymizationService;
AnonymizationService.SALT = 'wayshare-privacy-salt-2024';

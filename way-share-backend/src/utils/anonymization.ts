import crypto from 'crypto';
import { config } from '../config/config';

export class AnonymizationService {
  private static readonly SALT = 'wayshare-privacy-salt-2024';

  /**
   * Hash a license plate using SHA-256 with salt
   * This is a one-way, irreversible hash for privacy protection
   */
  static hashLicensePlate(licensePlate: string): string {
    if (!licensePlate) {
      throw new Error('License plate is required');
    }

    // Normalize the license plate: uppercase, remove spaces and special characters
    const normalized = licensePlate
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    // Create hash with salt
    const hash = crypto
      .createHash(config.anonymization.hashAlgorithm)
      .update(normalized + this.SALT)
      .digest('hex');

    // Return first 16 characters for storage efficiency
    return hash.substring(0, 16);
  }

  /**
   * Generate a session ID for anonymous users
   */
  static generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Round coordinates to nearest 100m for privacy
   */
  static roundCoordinates(lat: number, lng: number): { roundedLat: number; roundedLng: number } {
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
  static async stripExifData(imageBuffer: Buffer): Promise<Buffer> {
    // TODO: Implement EXIF stripping
    // For MVP, this is a placeholder
    return imageBuffer;
  }

  /**
   * Validate that a string is properly anonymized (hashed)
   */
  static isAnonymized(value: string): boolean {
    // Check if it matches our hash pattern (16 hex characters)
    return /^[a-f0-9]{16}$/.test(value);
  }
}
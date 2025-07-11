"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config/config");
class UploadService {
    constructor() {
        // In production, this would use S3 or similar cloud storage
        // For development/testing, use /tmp which is writable
        this.uploadDir = process.env.UPLOAD_DIR || '/tmp/wayshare-uploads';
        this.ensureUploadDir().catch(err => {
            console.error('Failed to create upload directory:', err);
            // Don't fail startup if upload dir can't be created
        });
    }
    async ensureUploadDir() {
        try {
            await promises_1.default.access(this.uploadDir);
        }
        catch {
            await promises_1.default.mkdir(this.uploadDir, { recursive: true });
        }
    }
    /**
     * Upload a document to storage
     * In production, this would upload to S3
     */
    async uploadDocument(file, folder, userId) {
        // Validate file type
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf'
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.');
        }
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('File size exceeds 10MB limit');
        }
        // Generate unique filename
        const fileExtension = path_1.default.extname(file.originalname);
        const uniqueId = crypto_1.default.randomBytes(16).toString('hex');
        const filename = `${userId}_${uniqueId}${fileExtension}`;
        const filePath = path_1.default.join(folder, filename);
        // In development, save to local filesystem
        if (config_1.config.env === 'development') {
            const fullPath = path_1.default.join(this.uploadDir, filePath);
            const dirPath = path_1.default.dirname(fullPath);
            // Ensure directory exists
            await promises_1.default.mkdir(dirPath, { recursive: true });
            // Write file
            await promises_1.default.writeFile(fullPath, file.buffer);
            // Return URL that would be used to access the file
            return `/uploads/${filePath}`;
        }
        // In production, this would upload to S3
        // Example S3 implementation:
        /*
        const s3Params = {
          Bucket: config.aws.s3Bucket,
          Key: filePath,
          Body: file.buffer,
          ContentType: file.mimetype,
          ServerSideEncryption: 'AES256',
          Metadata: {
            userId,
            uploadedAt: new Date().toISOString()
          }
        };
    
        const result = await s3.upload(s3Params).promise();
        return result.Location;
        */
        // For now, return a mock S3 URL
        return `https://${config_1.config.aws.s3Bucket}.s3.amazonaws.com/${filePath}`;
    }
    /**
     * Delete a document from storage
     */
    async deleteDocument(documentUrl) {
        if (config_1.config.env === 'development') {
            // Extract file path from URL
            const filePath = documentUrl.replace('/uploads/', '');
            const fullPath = path_1.default.join(this.uploadDir, filePath);
            try {
                await promises_1.default.unlink(fullPath);
            }
            catch (error) {
                console.error('Failed to delete file:', error);
            }
        }
        // In production, this would delete from S3
        /*
        const key = documentUrl.replace(`https://${config.aws.s3Bucket}.s3.amazonaws.com/`, '');
        await s3.deleteObject({
          Bucket: config.aws.s3Bucket,
          Key: key
        }).promise();
        */
    }
    /**
     * Get a signed URL for secure document access
     * In production, this would generate S3 presigned URLs
     */
    async getSignedUrl(documentUrl, _expiresIn = 3600) {
        if (config_1.config.env === 'development') {
            // In development, just return the original URL
            return documentUrl;
        }
        // In production, generate S3 presigned URL
        /*
        const key = documentUrl.replace(`https://${config.aws.s3Bucket}.s3.amazonaws.com/`, '');
        return s3.getSignedUrlPromise('getObject', {
          Bucket: config.aws.s3Bucket,
          Key: key,
          Expires: expiresIn
        });
        */
        return documentUrl;
    }
    /**
     * Validate uploaded file
     */
    validateFile(file) {
        if (!file) {
            return { valid: false, error: 'No file provided' };
        }
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf'
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return {
                valid: false,
                error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.'
            };
        }
        if (file.size > 10 * 1024 * 1024) {
            return {
                valid: false,
                error: 'File size exceeds 10MB limit'
            };
        }
        return { valid: true };
    }
}
exports.uploadService = new UploadService();

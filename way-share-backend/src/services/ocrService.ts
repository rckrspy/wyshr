// import { config } from '../config/config';

interface OCRResult {
  text: string;
  confidence: number;
  extractedData: {
    name?: string;
    licensePlate?: string;
    state?: string;
    expirationDate?: string;
    documentType?: 'insurance' | 'registration' | 'title';
  };
}

interface ExtractedName {
  fullName: string;
  confidence: number;
}

class OCRService {
  /**
   * Process a document image and extract text
   * This is a mock implementation that should be replaced with actual OCR service
   * like Google Vision API or AWS Textract
   */
  async processDocument(documentUrl: string): Promise<OCRResult> {
    // In production, this would:
    // 1. Download the document from S3
    // 2. Send to OCR service (Google Vision/AWS Textract)
    // 3. Parse the response and extract relevant fields
    
    console.log('Processing document:', documentUrl);
    
    // Mock implementation for development
    // Returns realistic test data based on document URL
    if (documentUrl.includes('insurance')) {
      return {
        text: 'INSURANCE CARD\nName: JOHN DOE\nPolicy: 123456789\nVehicle: 2020 HONDA CIVIC\nPlate: ABC123\nState: CA\nExpires: 12/31/2024',
        confidence: 0.95,
        extractedData: {
          name: 'JOHN DOE',
          licensePlate: 'ABC123',
          state: 'CA',
          expirationDate: '12/31/2024',
          documentType: 'insurance'
        }
      };
    } else if (documentUrl.includes('registration')) {
      return {
        text: 'VEHICLE REGISTRATION\nRegistered Owner: JOHN DOE\nLicense Plate: ABC123\nState: CA\nVIN: 1HGCV1F30JA123456\nExpires: 06/30/2024',
        confidence: 0.92,
        extractedData: {
          name: 'JOHN DOE',
          licensePlate: 'ABC123',
          state: 'CA',
          expirationDate: '06/30/2024',
          documentType: 'registration'
        }
      };
    }
    
    // Default response for unknown document types
    return {
      text: 'Unable to process document',
      confidence: 0,
      extractedData: {}
    };
  }

  /**
   * Extract name from OCR results with confidence scoring
   */
  extractName(ocrText: string): ExtractedName {
    // Common patterns for name extraction
    const namePatterns = [
      /(?:Name|Owner|Insured|Registered to)[:\s]+([A-Z][A-Z\s]+)/i,
      /(?:Policy Holder|Account Holder)[:\s]+([A-Z][A-Z\s]+)/i,
      /^([A-Z][A-Z\s]+)$/m // Line with just capital letters
    ];

    for (const pattern of namePatterns) {
      const match = ocrText.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Calculate confidence based on pattern match quality
        const confidence = name.split(' ').length >= 2 ? 0.9 : 0.7;
        return {
          fullName: name,
          confidence
        };
      }
    }

    return {
      fullName: '',
      confidence: 0
    };
  }

  /**
   * Compare extracted name with verified identity name
   */
  compareNames(extractedName: string, verifiedName: string): number {
    if (!extractedName || !verifiedName) {
      return 0;
    }

    // Normalize names for comparison
    const normalize = (name: string) => 
      name.toUpperCase().replace(/[^A-Z\s]/g, '').trim();

    const normalized1 = normalize(extractedName);
    const normalized2 = normalize(verifiedName);

    // Exact match
    if (normalized1 === normalized2) {
      return 1.0;
    }

    // Check if all parts of one name are in the other
    const parts1 = normalized1.split(/\s+/);
    const parts2 = normalized2.split(/\s+/);

    let matchingParts = 0;
    for (const part of parts1) {
      if (parts2.includes(part)) {
        matchingParts++;
      }
    }

    // Calculate similarity score
    const similarity = matchingParts / Math.max(parts1.length, parts2.length);
    
    // Boost score if last names match (usually more important)
    const lastName1 = parts1[parts1.length - 1];
    const lastName2 = parts2[parts2.length - 1];
    if (lastName1 === lastName2 && similarity > 0.5) {
      return Math.min(similarity + 0.2, 1.0);
    }

    return similarity;
  }

  /**
   * Determine if manual review is required based on confidence scores
   */
  requiresManualReview(
    ocrConfidence: number,
    nameMatchScore: number,
    documentType: string
  ): boolean {
    // Require manual review if:
    // 1. OCR confidence is low
    if (ocrConfidence < 0.8) return true;
    
    // 2. Name match is poor
    if (nameMatchScore < 0.7) return true;
    
    // 3. Critical documents always need review if match isn't perfect
    if (documentType === 'insurance' && nameMatchScore < 0.9) return true;
    
    return false;
  }

  /**
   * Process a vehicle verification document
   */
  async processVehicleDocument(
    documentUrl: string,
    expectedName: string,
    expectedLicensePlate?: string
  ): Promise<{
    success: boolean;
    extractedData: OCRResult['extractedData'];
    nameMatch: number;
    requiresReview: boolean;
    confidence: number;
  }> {
    try {
      // Process document with OCR
      const ocrResult = await this.processDocument(documentUrl);
      
      // Extract and compare name
      const extractedName = ocrResult.extractedData.name || '';
      const nameMatch = this.compareNames(extractedName, expectedName);
      
      // Check if license plate matches (if provided)
      let plateMatch = 1.0;
      if (expectedLicensePlate && ocrResult.extractedData.licensePlate) {
        const extractedPlate = ocrResult.extractedData.licensePlate.toUpperCase();
        const expectedPlate = expectedLicensePlate.toUpperCase();
        plateMatch = extractedPlate === expectedPlate ? 1.0 : 0.0;
      }
      
      // Determine if manual review is needed
      const requiresReview = this.requiresManualReview(
        ocrResult.confidence,
        nameMatch,
        ocrResult.extractedData.documentType || 'unknown'
      );
      
      // Overall confidence score
      const confidence = ocrResult.confidence * nameMatch * plateMatch;
      
      return {
        success: confidence > 0.7 && !requiresReview,
        extractedData: ocrResult.extractedData,
        nameMatch,
        requiresReview,
        confidence
      };
    } catch (error) {
      console.error('Error processing vehicle document:', error);
      return {
        success: false,
        extractedData: {},
        nameMatch: 0,
        requiresReview: true,
        confidence: 0
      };
    }
  }
}

export const ocrService = new OCRService();
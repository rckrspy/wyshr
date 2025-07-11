import Stripe from 'stripe';
import { pool } from './database';
import { config } from '../config/config';

interface IdentityVerification {
  id: string;
  user_id: string;
  stripe_verification_id: string;
  status: 'pending' | 'processing' | 'verified' | 'failed' | 'cancelled';
  verified_name?: string;
  verified_at?: Date;
  failure_reason?: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

interface CreateVerificationSession {
  userId: string;
  email: string;
  returnUrl: string;
  refreshUrl?: string;
}

class IdentityVerificationService {
  private stripe: Stripe;

  constructor() {
    // Only initialize Stripe if key is provided
    if (config.stripe.secretKey) {
      this.stripe = new Stripe(config.stripe.secretKey, {
        apiVersion: '2025-06-30.basil',
      });
    } else {
      console.warn('Stripe secret key not configured - identity verification features will be disabled');
      this.stripe = null as unknown as Stripe; // Type assertion for development without Stripe
    }
  }

  async createVerificationSession({
    userId,
    email,
    returnUrl,
  }: CreateVerificationSession): Promise<{ sessionId: string; url: string }> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured - identity verification is disabled');
    }
    
    try {
      // Check if user already has a pending verification
      const existingVerification = await this.getUserVerification(userId);
      if (existingVerification && existingVerification.status === 'pending') {
        // Return existing session if still valid
        const session = await this.stripe.identity.verificationSessions.retrieve(
          existingVerification.stripe_verification_id
        );
        if (session.status === 'requires_input') {
          return { sessionId: session.id, url: session.url! };
        }
      }

      // Create new Stripe Identity verification session
      const session = await this.stripe.identity.verificationSessions.create({
        type: 'document',
        metadata: {
          user_id: userId,
          email: email,
        },
        options: {
          document: {
            require_matching_selfie: true,
            allowed_types: ['driving_license', 'passport', 'id_card'],
          },
        },
        return_url: returnUrl,
      });

      // Store verification record in database
      await pool.query(
        `INSERT INTO identity_verifications (user_id, stripe_verification_id, status, metadata)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE
         SET stripe_verification_id = $2, status = $3, updated_at = NOW()`,
        [userId, session.id, 'pending', { email }]
      );

      return { sessionId: session.id, url: session.url! };
    } catch (error) {
      console.error('Error creating verification session:', error);
      throw new Error('Failed to create verification session');
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'identity.verification_session.created':
      case 'identity.verification_session.processing':
      case 'identity.verification_session.verified':
      case 'identity.verification_session.requires_input':
      case 'identity.verification_session.canceled':
        await this.updateVerificationStatus(event.data.object as Stripe.Identity.VerificationSession);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async updateVerificationStatus(session: Stripe.Identity.VerificationSession): Promise<void> {
    const userId = session.metadata?.user_id;
    if (!userId) {
      console.error('No user_id in session metadata');
      return;
    }

    let status: IdentityVerification['status'] = 'pending';
    let verified_name: string | null = null;
    let verified_at: Date | null = null;
    let failure_reason: string | null = null;

    switch (session.status) {
      case 'requires_input':
        status = 'pending';
        break;
      case 'processing':
        status = 'processing';
        break;
      case 'verified':
        status = 'verified';
        verified_at = new Date();
        // Extract verified name from the session
        if (session.verified_outputs?.first_name && session.verified_outputs?.last_name) {
          verified_name = `${session.verified_outputs.first_name} ${session.verified_outputs.last_name}`;
        }
        break;
      case 'canceled':
        status = 'cancelled';
        failure_reason = 'User cancelled verification';
        break;
    }

    // Update database
    await pool.query(
      `UPDATE identity_verifications
       SET status = $1, verified_name = $2, verified_at = $3, failure_reason = $4, 
           metadata = metadata || $5::jsonb, updated_at = NOW()
       WHERE stripe_verification_id = $6`,
      [
        status,
        verified_name,
        verified_at,
        failure_reason,
        JSON.stringify({ last_updated: new Date().toISOString() }),
        session.id,
      ]
    );

    // If verified, update user table
    if (status === 'verified') {
      await pool.query(
        `UPDATE users 
         SET identity_verified = true, 
             identity_verification_id = (SELECT id FROM identity_verifications WHERE stripe_verification_id = $1)
         WHERE id = $2`,
        [session.id, userId]
      );
    }
  }

  async getUserVerification(userId: string): Promise<IdentityVerification | null> {
    const result = await pool.query(
      'SELECT * FROM identity_verifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async getVerificationStatus(userId: string): Promise<{
    isVerified: boolean;
    verification: IdentityVerification | null;
  }> {
    const verification = await this.getUserVerification(userId);
    return {
      isVerified: verification?.status === 'verified',
      verification,
    };
  }

  async checkSessionStatus(sessionId: string): Promise<Stripe.Identity.VerificationSession> {
    try {
      const session = await this.stripe.identity.verificationSessions.retrieve(sessionId);
      // Update our database with latest status
      await this.updateVerificationStatus(session);
      return session;
    } catch (error) {
      console.error('Error checking session status:', error);
      throw new Error('Failed to check verification status');
    }
  }

  async cancelVerification(userId: string): Promise<void> {
    const verification = await this.getUserVerification(userId);
    if (!verification || verification.status !== 'pending') {
      throw new Error('No pending verification to cancel');
    }

    try {
      await this.stripe.identity.verificationSessions.cancel(verification.stripe_verification_id);
    } catch (error) {
      console.error('Error cancelling Stripe session:', error);
    }

    await pool.query(
      `UPDATE identity_verifications 
       SET status = 'cancelled', failure_reason = 'User cancelled', updated_at = NOW()
       WHERE user_id = $1 AND status = 'pending'`,
      [userId]
    );
  }
}

export const identityVerificationService = new IdentityVerificationService();
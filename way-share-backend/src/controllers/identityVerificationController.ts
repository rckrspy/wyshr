import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { identityVerificationService } from '../services/identityVerificationService';
import Stripe from 'stripe';
import { config } from '../config/config';

// Only initialize Stripe if key is provided
const stripe = config.stripe.secretKey 
  ? new Stripe(config.stripe.secretKey, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

export const createVerificationSession = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { returnUrl, refreshUrl } = req.body;

    if (!returnUrl || !refreshUrl) {
      res.status(400).json({ error: 'Return URL and refresh URL are required' });
      return;
    }

    // Get user email
    const user = await req.app.locals.authService.findUserById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { sessionId, url } = await identityVerificationService.createVerificationSession({
      userId: req.userId,
      email: user.email,
      returnUrl,
      refreshUrl,
    });

    res.json({
      sessionId,
      url,
      message: 'Verification session created successfully',
    });
  } catch (error) {
    console.error('Create verification session error:', error);
    res.status(500).json({ error: 'Failed to create verification session' });
  }
};

export const getVerificationStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const status = await identityVerificationService.getVerificationStatus(req.userId);

    res.json({
      isVerified: status.isVerified,
      verification: status.verification
        ? {
            id: status.verification.id,
            status: status.verification.status,
            verifiedName: status.verification.verified_name,
            verifiedAt: status.verification.verified_at,
            failureReason: status.verification.failure_reason,
            createdAt: status.verification.created_at,
          }
        : null,
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
};

export const checkSessionStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }

    const session = await identityVerificationService.checkSessionStatus(sessionId);

    res.json({
      status: session.status,
      url: session.url,
      lastError: session.last_error,
    });
  } catch (error) {
    console.error('Check session status error:', error);
    res.status(500).json({ error: 'Failed to check session status' });
  }
};

export const cancelVerification = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await identityVerificationService.cancelVerification(req.userId);

    res.json({
      message: 'Verification cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel verification error:', error);
    res.status(500).json({ error: 'Failed to cancel verification' });
  }
};

export const handleStripeWebhook = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!stripe) {
    res.status(501).json({ error: 'Stripe is not configured' });
    return;
  }
  
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    res.status(400).json({ error: 'No Stripe signature found' });
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.webhookSecret
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', errorMessage);
    res.status(400).json({ error: `Webhook Error: ${errorMessage}` });
    return;
  }

  try {
    await identityVerificationService.handleWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = exports.cancelVerification = exports.checkSessionStatus = exports.getVerificationStatus = exports.createVerificationSession = void 0;
const identityVerificationService_1 = require("../services/identityVerificationService");
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("../config/config");
// Only initialize Stripe if key is provided
const stripe = config_1.config.stripe.secretKey
    ? new stripe_1.default(config_1.config.stripe.secretKey, {
        apiVersion: '2025-06-30.basil',
    })
    : null;
const createVerificationSession = async (req, res) => {
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
        const { sessionId, url } = await identityVerificationService_1.identityVerificationService.createVerificationSession({
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
    }
    catch (error) {
        console.error('Create verification session error:', error);
        res.status(500).json({ error: 'Failed to create verification session' });
    }
};
exports.createVerificationSession = createVerificationSession;
const getVerificationStatus = async (req, res) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const status = await identityVerificationService_1.identityVerificationService.getVerificationStatus(req.userId);
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
    }
    catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({ error: 'Failed to get verification status' });
    }
};
exports.getVerificationStatus = getVerificationStatus;
const checkSessionStatus = async (req, res) => {
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
        const session = await identityVerificationService_1.identityVerificationService.checkSessionStatus(sessionId);
        res.json({
            status: session.status,
            url: session.url,
            lastError: session.last_error,
        });
    }
    catch (error) {
        console.error('Check session status error:', error);
        res.status(500).json({ error: 'Failed to check session status' });
    }
};
exports.checkSessionStatus = checkSessionStatus;
const cancelVerification = async (req, res) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        await identityVerificationService_1.identityVerificationService.cancelVerification(req.userId);
        res.json({
            message: 'Verification cancelled successfully',
        });
    }
    catch (error) {
        console.error('Cancel verification error:', error);
        res.status(500).json({ error: 'Failed to cancel verification' });
    }
};
exports.cancelVerification = cancelVerification;
const handleStripeWebhook = async (req, res) => {
    if (!stripe) {
        res.status(501).json({ error: 'Stripe is not configured' });
        return;
    }
    const sig = req.headers['stripe-signature'];
    if (!sig) {
        res.status(400).json({ error: 'No Stripe signature found' });
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, config_1.config.stripe.webhookSecret);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Webhook signature verification failed:', errorMessage);
        res.status(400).json({ error: `Webhook Error: ${errorMessage}` });
        return;
    }
    try {
        await identityVerificationService_1.identityVerificationService.handleWebhook(event);
        res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};
exports.handleStripeWebhook = handleStripeWebhook;

"use strict";
// Email service placeholder - to be implemented with actual email provider
// Options: SendGrid, AWS SES, Mailgun, etc.
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
async function sendEmail(options) {
    // TODO: Implement actual email sending
    // For now, just log the email
    console.log('Email Service - Would send email:', {
        to: options.to,
        subject: options.subject,
        preview: options.text.substring(0, 100) + '...'
    });
    // In production, this would integrate with an email service like:
    // - SendGrid: await sgMail.send(msg);
    // - AWS SES: await ses.sendEmail(params).promise();
    // - Nodemailer: await transporter.sendMail(options);
    // For development, you could also write to a file or use a service like MailHog
}
async function sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${token}`;
    await sendEmail({
        to: email,
        subject: 'Verify your Way-Share account',
        text: `Please verify your email by clicking this link: ${verificationUrl}`,
        html: `
      <h2>Welcome to Way-Share!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>Or copy and paste this link: ${verificationUrl}</p>
    `
    });
}
async function sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
    await sendEmail({
        to: email,
        subject: 'Reset your Way-Share password',
        text: `Reset your password by clicking this link: ${resetUrl}`,
        html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>Or copy and paste this link: ${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
    });
}

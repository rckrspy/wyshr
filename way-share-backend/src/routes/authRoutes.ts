import { Router } from 'express';
import { authController, authValidation } from '../controllers/authController';

const router = Router();

// Public auth routes
router.post('/register', authValidation.register, authController.register);
router.post('/login', authValidation.login, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authValidation.forgotPassword, authController.forgotPassword);
router.post('/reset-password', authValidation.resetPassword, authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

export default router;
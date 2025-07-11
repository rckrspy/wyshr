"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// Public auth routes
router.post('/register', authController_1.authValidation.register, authController_1.authController.register);
router.post('/login', authController_1.authValidation.login, authController_1.authController.login);
router.post('/logout', authController_1.authController.logout);
router.post('/refresh', authController_1.authController.refresh);
router.post('/forgot-password', authController_1.authValidation.forgotPassword, authController_1.authController.forgotPassword);
router.post('/reset-password', authController_1.authValidation.resetPassword, authController_1.authController.resetPassword);
router.get('/verify-email/:token', authController_1.authController.verifyEmail);
exports.default = router;

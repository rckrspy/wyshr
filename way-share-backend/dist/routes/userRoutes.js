"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All user routes require authentication
router.use(auth_1.authenticateToken);
// User profile routes
router.get('/profile', userController_1.userController.getProfile);
router.put('/profile', userController_1.userController.updateProfile);
router.delete('/account', userController_1.userController.deleteAccount);
exports.default = router;

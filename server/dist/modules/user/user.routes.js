"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// Get user profile - protected by auth middleware
router.get('/profile', auth_middleware_1.authMiddleware, userController.getUserProfile);
// Update user profile - protected by auth middleware
router.put('/profile', auth_middleware_1.authMiddleware, userController.updateUserProfile);
// Delete user account - protected by auth middleware
router.delete('/profile', auth_middleware_1.authMiddleware, userController.deleteUser);
exports.default = router;

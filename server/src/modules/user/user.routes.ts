import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// Get user profile - protected by auth middleware
router.get('/profile', authMiddleware, userController.getUserProfile);

// Update user profile - protected by auth middleware
router.put('/profile', authMiddleware, userController.updateUserProfile);

// Delete user account - protected by auth middleware
router.delete('/profile', authMiddleware, userController.deleteUser);

export default router; 
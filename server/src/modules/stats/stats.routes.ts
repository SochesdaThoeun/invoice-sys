import { Router } from 'express';
import { StatsController } from './stats.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const statsRouter = Router();
const statsController = new StatsController();

// GET monthly stats for the authenticated seller
statsRouter.get('/monthly', authMiddleware, statsController.getMonthlyStats);

export default statsRouter; 
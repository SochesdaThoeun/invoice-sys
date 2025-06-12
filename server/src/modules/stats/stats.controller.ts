import { Request, Response } from 'express';
import { StatsService } from './stats.service';

export class StatsController {
  private statsService: StatsService;

  constructor() {
    this.statsService = new StatsService();
  }

  public getMonthlyStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const stats = await this.statsService.getMonthlyStats(sellerId);
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get monthly stats', error });
    }
  };
} 
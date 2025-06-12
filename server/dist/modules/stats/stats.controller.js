"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const stats_service_1 = require("./stats.service");
class StatsController {
    constructor() {
        this.getMonthlyStats = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const stats = await this.statsService.getMonthlyStats(sellerId);
                res.status(200).json(stats);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to get monthly stats', error });
            }
        };
        this.statsService = new stats_service_1.StatsService();
    }
}
exports.StatsController = StatsController;

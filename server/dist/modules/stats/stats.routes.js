"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_controller_1 = require("./stats.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const statsRouter = (0, express_1.Router)();
const statsController = new stats_controller_1.StatsController();
// GET monthly stats for the authenticated seller
statsRouter.get('/monthly', auth_middleware_1.authMiddleware, statsController.getMonthlyStats);
exports.default = statsRouter;

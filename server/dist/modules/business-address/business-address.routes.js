"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const business_address_controller_1 = require("./business-address.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const businessAddressRouter = (0, express_1.Router)();
const controller = new business_address_controller_1.BusinessAddressController();
// Apply auth middleware to all routes
businessAddressRouter.use(auth_middleware_1.authMiddleware);
// Define routes
businessAddressRouter.post('/', (req, res) => controller.create(req, res));
businessAddressRouter.get('/', (req, res) => controller.findAllForSeller(req, res));
businessAddressRouter.get('/:id', (req, res) => controller.findOne(req, res));
businessAddressRouter.patch('/:id', (req, res) => controller.update(req, res));
businessAddressRouter.delete('/:id', (req, res) => controller.remove(req, res));
exports.default = businessAddressRouter;

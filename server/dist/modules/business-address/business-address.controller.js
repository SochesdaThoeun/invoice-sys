"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessAddressController = void 0;
const business_address_service_1 = require("./business-address.service");
class BusinessAddressController {
    constructor() {
        this.service = new business_address_service_1.BusinessAddressService();
    }
    async create(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const businessAddress = await this.service.create(userId, req.body);
            res.status(201).json(businessAddress);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: 'An unknown error occurred' });
            }
        }
    }
    async findAllForSeller(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const businessAddresses = await this.service.findAllForSeller(userId);
            res.json(businessAddresses);
        }
        catch (error) {
            res.status(500).json({ message: error });
        }
    }
    async findOne(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const businessAddress = await this.service.findOne(userId, req.params.id);
            if (!businessAddress) {
                res.status(404).json({ message: 'Business address not found' });
                return;
            }
            res.json(businessAddress);
        }
        catch (error) {
            res.status(500).json({ message: error });
        }
    }
    async update(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const businessAddress = await this.service.update(userId, req.params.id, req.body);
            if (!businessAddress) {
                res.status(404).json({ message: 'Business address not found' });
                return;
            }
            res.json(businessAddress);
        }
        catch (error) {
            res.status(500).json({ message: error });
        }
    }
    async remove(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            await this.service.remove(userId, req.params.id);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ message: error });
        }
    }
}
exports.BusinessAddressController = BusinessAddressController;

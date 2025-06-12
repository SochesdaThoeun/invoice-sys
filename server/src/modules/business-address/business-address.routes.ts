import { Router } from 'express';
import { BusinessAddressController } from './business-address.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const businessAddressRouter = Router();
const controller = new BusinessAddressController();

// Apply auth middleware to all routes
businessAddressRouter.use(authMiddleware);

// Define routes
businessAddressRouter.post('/', (req, res) => controller.create(req, res));
businessAddressRouter.get('/', (req, res) => controller.findAllForSeller(req, res));
businessAddressRouter.get('/:id', (req, res) => controller.findOne(req, res));
businessAddressRouter.patch('/:id', (req, res) => controller.update(req, res));
businessAddressRouter.delete('/:id', (req, res) => controller.remove(req, res));

export default businessAddressRouter; 
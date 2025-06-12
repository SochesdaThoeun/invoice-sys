import { Request, Response } from 'express';
import { BusinessAddressService } from './business-address.service';

export class BusinessAddressController {
  private service: BusinessAddressService;

  constructor() {
    this.service = new BusinessAddressService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const businessAddress = await this.service.create(userId, req.body);
      res.status(201).json(businessAddress);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async findAllForSeller(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const businessAddresses = await this.service.findAllForSeller(userId);
      res.json(businessAddresses);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  async findOne(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      await this.service.remove(userId, req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
} 
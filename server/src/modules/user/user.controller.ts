import { Request, Response } from 'express';
import { UserService } from './user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;
      
      // Return the user from the request object to avoid an extra DB query
      // since the user is already loaded by the auth middleware
      res.status(200).json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        businessRegistrationNumber: req.user.businessRegistrationNumber,
        businessName: req.user.businessName,
        role: req.user.role,
        locale: req.user.locale,
        currency: req.user.currency
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user profile', error });
    }
  };

  public updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;
      const { name, email, phone, businessRegistrationNumber, businessName, locale, currency } = req.body;
      
      const updatedUser = await this.userService.updateUser(userId, {
        name,
        email,
        phone,
        businessRegistrationNumber,
        businessName,
        locale,
        currency
      });

      res.status(200).json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        businessRegistrationNumber: updatedUser.businessRegistrationNumber,
        businessName: updatedUser.businessName,
        role: updatedUser.role,
        locale: updatedUser.locale,
        currency: updatedUser.currency
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user profile', error });
    }
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;
      
      // Note: This would typically be a soft delete or have additional business logic
      // to handle related data (customers, orders, etc.)
      await this.userService.deleteUser(userId);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user', error });
    }
  };
} 
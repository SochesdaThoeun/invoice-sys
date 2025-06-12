import { AppDataSource } from '../../data-source';
import { User } from '../../entities/User';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  public findById = async (id: string): Promise<User | null> => {
    return this.userRepository.findOneBy({ id });
  };

  public updateUser = async (
    id: string, 
    userData: Partial<User>
  ): Promise<User> => {
    await this.userRepository.update(id, userData);
    
    const updatedUser = await this.userRepository.findOneBy({ id });
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    
    return updatedUser;
  };

  public deleteUser = async (id: string): Promise<void> => {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('User not found or could not be deleted');
    }
  };
} 
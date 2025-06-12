import { User, UserRole } from '../../entities/User';
import { AppDataSource } from '../../data-source';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { LoginDto, RegisterDto } from './auth.dto';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export default class AuthService {
  static async login(dto: LoginDto) {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { email: dto.email } });
    if (!user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');
    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return { 
      token, 
      user: { 
        id: user.id, 
        name: user.name,
        email: user.email, 
        phone: user.phone,
        businessRegistrationNumber: user.businessRegistrationNumber,
        businessName: user.businessName,
        role: user.role,
        locale: user.locale,
        currency: user.currency
      } 
    };
  }

  static async register(dto: RegisterDto) {
    const repo = AppDataSource.getRepository(User);
    const exists = await repo.findOne({ where: { email: dto.email } });
    if (exists) throw new Error('Email already in use');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = repo.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      businessRegistrationNumber: dto.businessRegistrationNumber,
      businessName: dto.businessName,
      passwordHash,
      role: dto.role || UserRole.SELLER,
      locale: dto.locale,
      currency: dto.currency,
    });
    await repo.save(user);
    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return { 
      token, 
      user: { 
        id: user.id, 
        name: user.name,
        email: user.email, 
        phone: user.phone,
        businessRegistrationNumber: user.businessRegistrationNumber,
        businessName: user.businessName,
        role: user.role,
        locale: user.locale,
        currency: user.currency
      } 
    };
  }
} 
import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../../entities/User';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  businessRegistrationNumber?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  currency?: string;
} 
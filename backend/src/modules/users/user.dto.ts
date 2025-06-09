// src/modules/users/user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  isVerified?: boolean;
  isActive?: boolean;


}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  isVerified?: boolean;

  @IsOptional()
  verificationToken?: string | null;
  


  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}
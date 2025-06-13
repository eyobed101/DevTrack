// src/auth/services/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from './jwt.service';
import { PasswordService } from './password.service';
import { UserService } from '../../users/user.service';
import { MailService } from '../../mail/mail.service';
import { User } from '../../users/entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpDto, LoginDto } from '../dto/auth.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }


    const isValid = await this.passwordService.validatePassword(
      password,
      user.password,
    );



    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: User) {
    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = await this.jwtService.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const existingUser = await this.usersService.findByEmailOrUsername(
      signUpDto.email,
      signUpDto.username,
    );

    if (existingUser) {
      throw new ConflictException('Email or username already in use');
    }

 

    const hashedPassword = await this.passwordService.hashPassword(
      signUpDto.password,
    );

    console.log(`Creating user with email: ${signUpDto.email}, username: ${signUpDto.username}`);
    console.log(`Hashed password: ${hashedPassword}`);

    const user = await this.usersService.create({
      ...signUpDto,
      firstName: signUpDto.firstName,
      lastName: signUpDto.lastName,
      password: hashedPassword,
      isVerified: false,
      isActive: true,
    });

    // Send verification email
    const verificationToken = this.jwtService.generateEmailVerificationToken(user);
    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return user;
  }

  async refreshTokens(refreshToken: string) {
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, user: { id: user.id } },
      relations: ['user'],
    });

    if (!storedToken || storedToken.isRevoked) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const newAccessToken = this.jwtService.generateAccessToken(user);
    const newRefreshToken = await this.jwtService.generateRefreshToken(user);

    await this.refreshTokenRepository.update(storedToken.id, {
      isRevoked: true,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verifyRefreshToken(refreshToken);
      await this.refreshTokenRepository.update(
        { token: refreshToken, user: { id: payload.sub } },
        { isRevoked: true },
      );
    } catch (error) {
      // Silent fail for invalid tokens
    }
  }

  async initiatePasswordReset(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return; // Silent fail for security

    const resetToken = this.jwtService.generatePasswordResetToken(user);
    await this.mailService.sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verifyPasswordResetToken(token);
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await this.passwordService.hashPassword(newPassword);
    await this.usersService.update(user.id, { password: hashedPassword });
  }
}
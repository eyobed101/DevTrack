import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../../config/database';
import { User } from '../../modules/users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { MailService } from '../../modules/mail/mail.service';
import { Request } from 'express';
import { MoreThan } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private userRepository = AppDataSource.getRepository(User);
  private refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'isActive'] 
    });

    if (user && user.isActive && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: User, req: Request) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, req);
    
    return { accessToken, refreshToken };
  }

  generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map(role => role.name),
    };
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  async generateRefreshToken(user: User, req: Request): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  async refreshAccessToken(refreshToken: string, req: Request) {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user', 'user.roles'],
    });

    if (!tokenEntity || tokenEntity.revoked || tokenEntity.expiresAt < new Date()) {
      throw new Error('Invalid refresh token');
    }

    // Rotate refresh token
    await this.revokeRefreshToken(tokenEntity.id);
    const newAccessToken = this.generateAccessToken(tokenEntity.user);
    const newRefreshToken = await this.generateRefreshToken(tokenEntity.user, req);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async revokeRefreshToken(tokenId: string) {
    await this.refreshTokenRepository.update(tokenId, { revoked: true });
  }

  async revokeAllUserTokens(userId: string) {
    await this.refreshTokenRepository.update(
      { userId, revoked: false },
      { revoked: true }
    );
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) return;

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.userRepository.update(user.id, {
      resetPasswordToken: token,
      resetPasswordExpires: expiresAt,
    });

    await this.mailService.sendPasswordResetEmail(user, token);
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (!user) throw new Error('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }
}
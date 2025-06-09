// src/auth/services/jwt.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) { }

  generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map(role => role.name) || [],
    };
    return this.nestJwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '1h',
    });
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload: JwtPayload = { sub: user.id };
    console.log(this.configService.get<string>('JWT_REFRESH_EXPIRATION'))
    const token = this.nestJwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'), // default 7 days
    });

    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() +
      parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '604800'), // default 7 days
    );

    await this.refreshTokenRepository.save({
      token,
      userId: user.id,
      expiresAt,
      isRevoked: false,
    });

    return token;
  }

  generateEmailVerificationToken(user: User): string {
    const payload: JwtPayload = { sub: user.id };
    console.log(this.configService.get<string>('JWT_REFRESH_EXPIRATION'))

    return this.nestJwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
      expiresIn: this.configService.get<string>('JWT_VERIFICATION_EXPIRATION'),
    });
  }

  generatePasswordResetToken(user: User): string {
    const payload: JwtPayload = { sub: user.id };
    console.log(this.configService.get<string>('JWT_REFRESH_EXPIRATION'))

    return this.nestJwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_RESET_SECRET'),
      expiresIn: this.configService.get<string>('JWT_RESET_EXPIRATION'),
    });
  }

  verifyRefreshToken(token: string): JwtPayload {
    return this.nestJwtService.verify(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  verifyEmailVerificationToken(token: string): JwtPayload {
    return this.nestJwtService.verify(token, {
      secret: this.configService.get<string>('JWT_VERIFICATION_SECRET'),
    });
  }

  verifyPasswordResetToken(token: string): JwtPayload {
    return this.nestJwtService.verify(token, {
      secret: this.configService.get<string>('JWT_RESET_SECRET'),
    });
  }
}
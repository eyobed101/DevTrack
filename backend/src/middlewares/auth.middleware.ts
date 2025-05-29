import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { User } from '../modules/users/entities/user.entity';
import { AppDataSource } from '../config/database';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private userRepository = AppDataSource.getRepository(User);
  
  constructor(private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies.accessToken || 
                      req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      return next();
    }

    try {
      const payload = this.jwtService.verify(accessToken, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['roles'],
      });

      if (user && user.isActive) {
        req.user = { id: Number(user.id), name: user.username };
      }
    } catch (error) {
      // Token verification failed - proceed without user
    }

    next();
  }
}
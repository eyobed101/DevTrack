import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { User } from '../modules/users/entities/user.entity';
import { AppDataSource } from '../config/database';

const jwtService = new JwtService({ secret: process.env.ACCESS_TOKEN_SECRET });
const userRepository = AppDataSource.getRepository(User);

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const accessToken =
    req.cookies.accessToken ||
    req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    return next();
  }

  try {
    const payload = jwtService.verify(accessToken, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });

    const user = await userRepository.findOne({
      where: { id: payload.sub },
      relations: ['roles'],
    });

    if (user && user.isActive) {
      req.user = { id: Number(user.id), name: user.username };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Token verification failed:', error.message);
    } else {
      console.error('Token verification failed:', error);
    }
    req.user = undefined;
  }

  next();
}
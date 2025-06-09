import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';
import { User } from '../modules/users/entities/user.entity';
import { UserService } from '../modules/users/user.service';

export const auth = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
      // 1. Get token from header
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
         res.status(401).json({ message: 'Authentication required' });
         return
      }

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
      
      // 3. Get user from database
      const user = await UserService.findById(decoded.sub);
      
      if (!user) {
         res.status(401).json({ message: 'Invalid token - user not found' });
         return
      }

      // 4. Attach user to request
      req.user = { id: Number(user.id), email: user.email, roles: user.roles.map(role => role.name) } as any;
      
      // 5. Continue to next middleware
      next();
    } catch (error) {
      logger.error('Authentication error:', error);
      
      if (error instanceof jwt.TokenExpiredError) {
         res.status(401).json({ message: 'Token expired' });
         return
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
         res.status(401).json({ message: 'Invalid token' });
         return
      }

       res.status(500).json({ message: 'Authentication failed' });
       return
    }
  };
};
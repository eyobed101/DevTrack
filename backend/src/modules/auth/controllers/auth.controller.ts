// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import { validate } from '../../../middlewares/validator';
import { AuthService } from '../auth.service';
import { UserService } from '../../users/user.service';
import { AppDataSource } from '../../../config/database';
import { User } from '../../users/entities/user.entity';
import { logger } from '../../../config/logger';
import { LoginDto, RegisterDto, RefreshTokenDto } from '../auth.dto';
import { createTokens, verifyRefreshToken } from '../../../common/utils/jwt';
import { authenticate } from '../../../middlewares/authenticate';

export class AuthController {
  private authService: AuthService;
  private userService: UserService;

  constructor() {
    const userRepository = AppDataSource.getRepository(User);
    this.authService = new AuthService(userRepository);
    this.userService = new UserService(userRepository);
  }

 

//   @validate(LoginDto)
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await this.authService.validateUser(email, password);

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      const { accessToken, refreshToken } = createTokens(user);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          },
          tokens: {
            accessToken,
            refreshToken
          }
        },
        message: 'Login successful'
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

//   @validate(RegisterDto)
  async register(req: Request, res: Response): Promise<void> {
    try {
      const existingUser = await this.userService.findByEmail(req.body.email);
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
        return;
      }

      const user = await this.authService.registerUser(req.body);
      const { accessToken, refreshToken } = createTokens(user);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          },
          tokens: {
            accessToken,
            refreshToken
          }
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a real implementation, you would invalidate the refresh token
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

//   @validate(RefreshTokenDto)
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const payload = verifyRefreshToken(refreshToken);

      if (!payload) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
        return;
      }

      const user = await this.userService.findById(payload.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const { accessToken, refreshToken: newRefreshToken } = createTokens(user);

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken
        },
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Token refresh failed'
      });
    }
  }

//   @authenticate
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user || typeof req.user.id !== 'number') {
            res.status(400).json({
              success: false,
              message: 'Invalid user information'
            });
            return;
          }
      const user = await this.userService.findById(req.user.id.toString());
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles
        },
        message: 'Current user retrieved'
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get current user'
      });
    }
  }
}
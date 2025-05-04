// src/modules/users/user.controller.ts
import { Request, Response } from 'express';
import { validate } from '../../../middlewares/validator';
import { UserService } from '../user.service';
import { CreateUserDto, UpdateUserDto } from '../user.dto';
import { AppDataSource } from '../../../config/database';
import { User } from '../entities/user.entity';
import { logger } from '../../../config/logger';

export class UserController {
  private userService: UserService;

  constructor() {
    const userRepository = AppDataSource.getRepository(User);
    this.userService = new UserService(userRepository);
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const users = await this.userService.findAll(
        parseInt(page as string),
        parseInt(limit as string)
      );
       res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: users.length
        }
      });
    } catch (error) {
      logger.error('Error fetching users:', error);
       res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.findById(req.params.id);
      if (!user) {
         res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
       res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error(`Error fetching user ${req.params.id}:`, error);
       res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }

//   @validate(CreateUserDto)
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.create(req.body);
       res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      logger.error('Error creating user:', error);
       res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'User creation failed'
      });
    }
  }

//   @validate(UpdateUserDto)
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.update(req.params.id, req.body);
      if (!user) {
         res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
       res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      logger.error(`Error updating user ${req.params.id}:`, error);
       res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'User update failed'
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.userService.delete(req.params.id);
      if (!result) {
         res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
       res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error(`Error deleting user ${req.params.id}:`, error);
       res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }
}
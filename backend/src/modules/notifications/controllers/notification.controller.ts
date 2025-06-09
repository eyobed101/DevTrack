// src/modules/notifications/notification.controller.ts
import { Request, Response } from 'express';
import { NotificationService } from '../notification.service';
import { AppDataSource } from '../../../config/database';
import { Notification } from '../entities/notification.entity';
import { User } from '../../users/entities/user.entity';
import { logger } from '../../../config/logger';
import { validate } from '../../../middlewares/validator';
import { CreateNotificationDto, MarkAsReadDto } from '../notification.dto';
import { NotificationType } from '../notification.enum';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const userRepository = AppDataSource.getRepository(User);
    this.notificationService = new NotificationService(notificationRepository, userRepository);
  
    this.getAllNotifications = this.getAllNotifications.bind(this);
    this.sendNotification = this.sendNotification.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.markAllAsRead = this.markAllAsRead.bind(this);
    
  }

  async getAllNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, read } = req.query;
      if (!req.user || typeof req.user.id !== 'number') {
        res.status(400).json({
          success: false,
          message: 'Invalid user information'
        });
        return;
      }
      const notifications = await this.notificationService.getUserNotifications(
        req.user.id,
        parseInt(page as string),
        parseInt(limit as string),
        read ? read === 'true' : undefined
      );
      res.status(200).json({
        success: true,
        data: notifications,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: notifications.length
        }
      });
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      });
    }
  }

//   @validate(CreateNotificationDto)
  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const notification = await this.notificationService.createNotification(
        req.body.type,
        req.body.recipientId,
        {
          title: req.body.title,
          message: req.body.message,
          relatedEntityType: req.body.relatedEntityType,
          relatedEntityId: req.body.relatedEntityId
        }
      );
      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification sent successfully'
      });
    } catch (error) {
      logger.error('Error sending notification:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send notification'
      });
    }
  }

//   @validate(MarkAsReadDto)
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {

        if (!req.user || typeof req.user.id !== 'number') {
            res.status(400).json({
              success: false,
              message: 'Invalid user information'
            });
            return;
          }
      const result = await this.notificationService.markAsRead(
        req.params.id,
        req.user.id
      );
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      logger.error(`Error marking notification ${req.params.id} as read:`, error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark notification as read'
      });
    }
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user || typeof req.user.id !== 'number') {
            res.status(400).json({
              success: false,
              message: 'Invalid user information'
            });
            return;
          }
      const count = await this.notificationService.markAllAsRead(req.user.id);
      res.status(200).json({
        success: true,
        message: `${count} notifications marked as read`
      });
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read'
      });
    }
  }
}
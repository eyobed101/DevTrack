// src/modules/notifications/notification.service.ts
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { NotificationType, RelatedEntityType } from './entities/notification.entity';

export class NotificationService {
  constructor(
    private notificationRepository: Repository<Notification>,
    private userRepository: Repository<User>
  ) {}

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
    isRead?: boolean
  ): Promise<Notification[]> {
    const where: any = { recipient: { id: userId } };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    return this.notificationRepository.find({
      where,
      relations: ['recipient'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });
  }

  async createNotification(
    type: NotificationType,
    recipientId: string,
    payload: {
      title: string;
      message: string;
      relatedEntityType?: RelatedEntityType;
      relatedEntityId?: string;
    }
  ): Promise<Notification> {
    const recipient = await this.userRepository.findOneBy({ id: recipientId });
    if (!recipient) {
      throw new Error('Recipient not found');
    }

    // Create notification instance explicitly to avoid type issues
    const notification = new Notification();
    notification.type = type;
    notification.recipient = recipient;
    notification.title = payload.title;
    notification.message = payload.message;
    notification.isRead = false;

    if (payload.relatedEntityType) {
      notification.relatedEntityType = payload.relatedEntityType;
    }
    if (payload.relatedEntityId) {
      notification.relatedEntityId = payload.relatedEntityId;
    }

    return this.notificationRepository.save(notification);
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.notificationRepository.update(
      { id: notificationId, recipient: { id: userId } },
      { isRead: true }
    );
    return result.affected !== 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository.update(
      { recipient: { id: userId }, isRead: false },
      { isRead: true }
    );
    return result.affected || 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        recipient: { id: userId },
        isRead: false
      }
    });
  }
}
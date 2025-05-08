import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType, RelatedEntityType } from './notification.enum';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsUUID()
  recipientId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(RelatedEntityType)
  @IsOptional()
  relatedEntityType?: RelatedEntityType;

  @IsUUID()
  @IsOptional()
  relatedEntityId?: string;
}

export class MarkAsReadDto {
  @IsUUID()
  @IsNotEmpty()
  notificationId: string;
}
// src/modules/notifications/entities/notification.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_DUE = 'task_due',
  TASK_COMMENT = 'task_comment',
  PROJECT_INVITE = 'project_invite',
  TEAM_INVITE = 'team_invite',
  SYSTEM_ALERT = 'system_alert'
}

export enum RelatedEntityType {
  TASK = 'task',
  PROJECT = 'project',
  TEAM = 'team'
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.notifications)
  recipient: User;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column({
    type: 'enum',
    enum: RelatedEntityType,
    nullable: true
  })
  relatedEntityType?: RelatedEntityType;

  @Column({ nullable: true })
  relatedEntityId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
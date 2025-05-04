// src/modules/tasks/entities/comment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Task, (task) => task.comments)
  task: Task;

  @ManyToOne(() => User)
  author: User;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
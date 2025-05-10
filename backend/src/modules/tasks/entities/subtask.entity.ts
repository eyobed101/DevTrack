// src/modules/tasks/entities/subtask.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class Subtask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: false })
  isCompleted: boolean;

  @ManyToOne(() => Task, (task) => task.subtasks)
  task: Task;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
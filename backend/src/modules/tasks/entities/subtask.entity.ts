// src/modules/tasks/entities/subtask.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  CreateDateColumn, 
  UpdateDateColumn,
  JoinColumn  // Add this import
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';
import { TaskStatus } from '../task.enum';

@Entity()
export class Subtask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.NOT_STARTED
  })
  status: TaskStatus;

  @ManyToOne(() => Task, (task) => task.subtasks)
  task: Task;

  @ManyToOne(() => User, (user) => user.assignedSubtasks, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })  // Now properly imported
  assignee: User | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
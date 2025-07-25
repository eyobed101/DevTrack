// src/modules/tasks/entities/task.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { Subtask } from './subtask.entity';
import { Comment } from './comment.entity';
import { Label } from './label.entity';
import { TaskStatus, TaskPriority } from '../task.enum';
import { TimeTracking } from '../../analytics/entities/time-tracking.entity';

export enum TeamMemberRole {
  OWNER = 'OWNER',
  TEAM_LEADER = 'TEAM_LEADER',
  MEMBER = 'MEMBER'
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => Project, (project) => project.tasks)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  // Multiple assignees
  @ManyToMany(() => User, (user) => user.assignedTasks)
  @JoinTable({
    name: 'task_assignees',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
  })
  assignees: User[];



  // Team leader (optional)
  @ManyToOne(() => User, (user) => user.teamLeaderTasks, { nullable: true })
  @JoinColumn({ name: 'team_leader_id' })
  teamLeader: User | null;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.NOT_STARTED
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  priority: TaskPriority;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'float', nullable: true })
  estimatedHours: number | null;
  
  @OneToMany(() => TimeTracking, (timeEntry) => timeEntry.task)
  timeEntries: TimeTracking[];

  @Column({ type: 'float', nullable: true })
  actualHours: number | null;

  @OneToMany(() => Subtask, (subtask) => subtask.task)
  subtasks: Subtask[];

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];
  
  

  @ManyToMany(() => Label)
  @JoinTable({
    name: 'task_labels',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'label_id', referencedColumnName: 'id' }
  })
  labels: Label[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
// src/modules/projects/entities/project.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProjectMember } from './project-member.entity';
import { Label } from '../../tasks/entities/label.entity';
import { Task } from '../../tasks/entities/task.entity';
import { ProjectUpdate } from './project-update.entity'; // Add this
import { ProjectFile } from './project-file.entity'; // Add this

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived' // Added archived status
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ProjectViewType {
  LIST = 'list',
  BOARD = 'board',
  CALENDAR = 'calendar',
  TABLE = 'table'
}

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User, user => user.projects)
  owner: User;

  @OneToMany(() => ProjectMember, member => member.project)
  members: ProjectMember[];

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING
  })
  status: ProjectStatus;

  // New fields
  @Column({
    type: 'enum',
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM
  })
  priority: ProjectPriority;

  @Column({ type: 'int', default: 0 })
  healthScore: number;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({
    type: 'enum',
    enum: ProjectViewType,
    default: ProjectViewType.BOARD
  })
  viewType: ProjectViewType;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: false })
  isPublic: boolean;

  @OneToMany(() => Label, (label) => label.project)
  labels: Label[];

  @ManyToMany(() => User, (user) => user.projects)
  @JoinTable()
  users: User[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  

  // New relationships
  @OneToMany(() => ProjectUpdate, update => update.project)
  updates: ProjectUpdate[];

  @OneToMany(() => ProjectFile, file => file.project)
  files: ProjectFile[];
}
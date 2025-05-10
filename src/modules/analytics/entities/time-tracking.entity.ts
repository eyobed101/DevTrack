import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class TimeTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Task)
  task: Task;

  @ManyToOne(() => Project)
  project: Project;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date;

  @Column({ type: 'integer', nullable: true })
  duration?: number; // in minutes

  @Column({ type: 'text', nullable: true })
  description?: string;

  
}

export default TimeTracking; // Ensure this is exported
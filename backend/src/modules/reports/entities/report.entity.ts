import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { ReportType, ReportStatus } from '../report.enum';

@Entity()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ReportType
  })
  type: ReportType;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING
  })
  status: ReportStatus;

  @Column({ type: 'json', nullable: true })
  filters: Record<string, any> | null;

  @Column({ type: 'json', nullable: true })
  data: any;

  @ManyToOne(() => Project)
  project: Project;

  @ManyToOne(() => User)
  generatedBy: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  generatedAt: Date | null;
}
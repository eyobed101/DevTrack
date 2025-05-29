// src/modules/projects/entities/project-update.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from './project.entity';

@Entity()
export class ProjectUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.projectUpdates)
  author: User;

  @ManyToOne(() => Project, project => project.updates)
  project: Project;

  @CreateDateColumn()
  createdAt: Date;
}
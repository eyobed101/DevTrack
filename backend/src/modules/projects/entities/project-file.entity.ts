// src/modules/projects/entities/project-file.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from './project.entity';

@Entity()
export class ProjectFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  mimetype: string;

  @Column({ type: 'int' })
  size: number;

  @ManyToOne(() => User, user => user.projectFiles)
  uploadedBy: User;

  @ManyToOne(() => Project, project => project.files)
  project: Project;

  @CreateDateColumn()
  uploadedAt: Date;
}
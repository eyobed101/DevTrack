// src/modules/projects/entities/project-member.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from './project.entity';

export enum ProjectRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

@Entity()
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.projectMemberships)
  user: User;

  @ManyToOne(() => Project, project => project.members)
  project: Project;

  @Column({
    type: 'enum',
    enum: ProjectRole,
    default: ProjectRole.MEMBER
  })
  role: ProjectRole;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;
}
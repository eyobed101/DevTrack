// src/modules/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany
} from 'typeorm';
import { Role } from '../../auth/entities/role.entity';
import { UserPreferences } from './user-preferences.entity';
import { TeamMember } from '../../teams/entities/team-member.entity';
import { Team } from '../../teams/entities/team.entity';
import { Project } from '../../projects/entities/project.entity';
import { ProjectMember } from '../../projects/entities/project-member.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Task } from '../../tasks/entities/task.entity';
import { ProjectUpdate } from '../../projects/entities/project-update.entity'; // Add this
import { ProjectFile } from '../../projects/entities/project-file.entity'; // Add this
import { Subtask } from '../../tasks/entities/subtask.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ default: 'UTC' })
  timezone: string;

  @Column({ default: 'en-US' })
  locale: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @OneToMany(() => Notification, notification => notification.recipient)
  notifications: Notification[];

  @OneToMany(() => ProjectMember, member => member.user)
  projectMemberships: ProjectMember[];

  @OneToMany(() => Project, project => project.owner)
  projects: Project[];

  @OneToMany(() => Team, team => team.owner)
  ownedTeams: Team[];

  @OneToMany(() => TeamMember, teamMember => teamMember.user)
  teamMemberships: TeamMember[];

  @ManyToMany(() => Task, task => task.assignees)
  assignedTasks: Task[];

  @ManyToMany(() => Role, role => role.users)
  @JoinTable()
  roles: Role[];

  @OneToOne(() => UserPreferences)
  @JoinColumn()
  preferences: UserPreferences;

  @OneToMany(() => Task, (task) => task.teamLeader)
  teamLeaderTasks: Task[];

  @OneToMany(() => Subtask, (subtask) => subtask.assignee)
  assignedSubtasks: Subtask[];

  // Add these new relationships
  @OneToMany(() => ProjectUpdate, update => update.author)
  projectUpdates: ProjectUpdate[];

  @OneToMany(() => ProjectFile, file => file.uploadedBy)
  projectFiles: ProjectFile[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
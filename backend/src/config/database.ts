// src/config/database.ts
import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Project } from '../modules/projects/entities/project.entity';
import { Team } from '../modules/teams/entities/team.entity';
import { TeamMember } from '../modules/teams/entities/team-member.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { Role } from '../modules/auth/entities/role.entity';
import { UserPreferences } from '../modules/users/entities/user-preferences.entity';
import { ProjectMember } from '../modules/projects/entities/project-member.entity';
import dotenv from 'dotenv';
import { TeamInvite } from '../modules/teams/entities/team-invite.entity';
import { Label } from '../modules/tasks/entities/label.entity';
import { Task } from '../modules/tasks/entities/task.entity';
import { Subtask } from '../modules/tasks/entities/subtask.entity';
import { Comment } from '../modules/tasks/entities/comment.entity';
import TimeTracking from '../modules/analytics/entities/time-tracking.entity';
import { ProjectUpdate } from '../modules/projects/entities/project-update.entity';
import { ProjectFile } from '../modules/projects/entities/project-file.entity';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity';
import { ConfigService } from '@nestjs/config';

dotenv.config();

// Import all other entities...

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'eyobed',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'collaboration_platform',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,

    // Add all your entities here
    ProjectFile,
    Role,
    RefreshToken,
    ProjectMember,
    ProjectUpdate,
    Project,

    Team,
    TeamMember,
    TeamInvite,
    Notification,
    Label,
    Task,
    Subtask,
    Comment,
    UserPreferences,
    ProjectMember,
    TimeTracking

    

  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
  extra: {
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false
  }
});
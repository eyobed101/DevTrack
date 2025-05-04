// src/modules/teams/entities/team-member.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Team } from './team.entity';

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member'
}

@Entity()
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.teamMemberships)
  user: User;

  @ManyToOne(() => Team, team => team.members)
  team: Team;

  @Column({
    type: 'enum',
    enum: TeamRole,
    default: TeamRole.MEMBER
  })
  role: TeamRole;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;
}

export default TeamMember;
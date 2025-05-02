// src/modules/teams/entities/team-invite.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { Team } from './team.entity';
import { TeamRole } from './team-role.enum'; // Adjusted the path to point to the correct location

@Entity()
export class TeamInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team, team => team.invites)
  team: Team;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: TeamRole
  })
  role: TeamRole;

  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
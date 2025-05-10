// src/modules/teams/entities/team.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TeamMember } from './team-member.entity';
import { TeamInvite } from './team-invite.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User, user => user.ownedTeams)
  owner: User;

  @OneToMany(() => TeamMember, member => member.team)
  members: TeamMember[];

  @OneToMany(() => TeamInvite, invite => invite.team)
  invites: TeamInvite[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Similar patterns for TeamMember and TeamInvite entities
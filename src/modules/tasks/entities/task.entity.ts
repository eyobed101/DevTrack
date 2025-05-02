// src/modules/auth/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Adjust the import path as necessary

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('simple-array')
  permissions: string[];

  @ManyToMany(() => User, user => user.roles)
  @JoinTable()
  users: User[];
}
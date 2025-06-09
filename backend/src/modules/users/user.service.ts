// src/modules/users/user.service.ts
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { hashPassword } from '../../common/utils/password';
import { Role } from '../auth/entities/role.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,) { }



  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findAll(page: number, limit: number): Promise<User[]> {
    return this.userRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['roles', 'preferences']
    });
  }

  static async findById(id: string): Promise<User | null> {
    // Replace this with your actual ORM/database logic
    // Example for TypeORM:
    // return await User.findOne({ where: { id } });
    // Example for Mongoose:
    // return await User.findById(id);

    throw new Error('findById method not implemented');
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'preferences']
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    // Ensure 'verificationToken' exists on the User entity, otherwise this will fail.
    // If it does not exist, add it to the User entity.
    return this.userRepository.findOneBy({ verificationToken: token } as any);
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [
        { email: email },
        { username: username }
      ]
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      password: createUserDto.password
    });
    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) return null;

    if (updateUserDto.password) {
      updateUserDto.password = await updateUserDto.password;
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected !== 0;
  }

  async assignRole(userId: number, roleId: number): Promise<void> {
    const user = await this.findById(userId.toString());
    if (!user) throw new Error('User not found');
    // Assuming user.roles is a relation array
    if (!user.roles) user.roles = [];
    // Fetch the full Role entity before assigning
    const roleRepository = this.userRepository.manager.getRepository(Role);
    const role = await roleRepository.findOneBy({ id: roleId.toString() });
    if (!role) throw new Error('Role not found');
    // Prevent duplicate roles
    if (!user.roles.some((r: Role) => Number(r.id) === roleId)) {
      user.roles.push(role);
      await this.update(userId.toString(), user);
    }
  }
}
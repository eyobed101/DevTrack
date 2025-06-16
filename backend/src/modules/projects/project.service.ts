// src/modules/projects/project.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity';
import { ProjectMember } from './entities/project-member.entity';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { ProjectRole } from './project.enum';
import { ProjectStatus } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
  ) {}

  async findAll(page: number, limit: number): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ['owner', 'members', 'members.user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findUserProjects(
    userId: string,
    page: number,
    limit: number,
  ): Promise<Project[]> {
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('members.user', 'memberUser')
      .leftJoinAndSelect('project.tasks', 'tasks')
      .where('owner.id = :userId', { userId })
      .orWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('member.projectId')
          .from(ProjectMember, 'member')
          .where('member.userId = :userId', { userId })
          .getQuery();
        return 'project.id IN ' + subQuery;
      })
      .orderBy('project.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }

  async findById(id: string): Promise<Project | null> {
    return this.projectRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user', 'tasks'],
    });
  }

  async create(
    createProjectDto: CreateProjectDto,
    ownerId: string,
  ): Promise<Project> {
    const owner = await this.userRepository.findOneBy({ id: ownerId });
    if (!owner) {
      throw new Error('Owner not found');
    }

    console.log('Creating project with owner:', owner);

    const project = this.projectRepository.create({
      ...createProjectDto,
      owner: owner,
      tags: Array.isArray(createProjectDto.tags)
        ? createProjectDto.tags
        : createProjectDto.tags
        ? [createProjectDto.tags]
        : undefined,
    });

    return this.projectRepository.save(project);
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project | null> {
    const project = await this.projectRepository.findOneBy({ id });
    if (!project) return null;

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.projectRepository.delete(id);
    return result.affected !== 0;
  }

  async addMember(
    projectId: string,
    userId: string,
    role: ProjectRole,
  ): Promise<boolean> {
    const project = await this.projectRepository.findOneBy({ id: projectId });
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!project || !user) return false;

    const member = this.projectMemberRepository.create({
      project,
      user,
      role,
    });

    await this.projectMemberRepository.save(member);
    return true;
  }

  async removeMember(projectId: string, userId: string): Promise<boolean> {
    const result = await this.projectMemberRepository.delete({
      project: { id: projectId },
      user: { id: userId },
    });
    return result.affected !== 0;
  }

  async updateStatus(
    projectId: string,
    status: string,
  ): Promise<Project | null> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      return null;
    }
    project.status = status as ProjectStatus;
    return this.projectRepository.save(project);
  }

  async updateProgress(
    projectId: string,
    progress: number,
  ): Promise<Project | null> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      return null;
    }
    project.progress = progress;
    return this.projectRepository.save(project);
  }
}
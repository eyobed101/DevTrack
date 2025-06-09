import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity';
import { ProjectMember } from './entities/project-member.entity';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { ProjectRole } from './project.enum';
// import { ProjectStatus } from './project.enum';
import { ProjectStatus } from './entities/project.entity';


export class ProjectService {
  constructor(
    private projectRepository: Repository<Project>,
    private userRepository: Repository<User>
  ) {}

  async findAll(page: number, limit: number): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ['owner', 'members', 'members.user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: string): Promise<Project | null> {
    return this.projectRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user', 'tasks']
    });
  }

  async create(createProjectDto: CreateProjectDto, ownerId: string): Promise<Project> {
    const owner = await this.userRepository.findOneBy({ id: ownerId });
    if (!owner) {
      throw new Error('Owner not found');
    }

    const project = this.projectRepository.create({
      ...createProjectDto,
      owner: { id: ownerId },
      
    });

    const savedProject = await this.projectRepository.save(project);
    return savedProject;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project | null> {
    const project = await this.projectRepository.findOneBy({ id });
    if (!project) return null;

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.projectRepository.delete(id);
    return result.affected !== 0;
  }

  async addMember(projectId: string, userId: string, role: ProjectRole): Promise<boolean> {
    const project = await this.projectRepository.findOneBy({ id: projectId });
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!project || !user) return false;

    const member = new ProjectMember();
    member.project = project;
    member.user = user;
    member.role = role;

    await this.projectRepository.manager.save(member);
    return true;
  }

  async removeMember(projectId: string, userId: string): Promise<boolean> {
    const result = await this.projectRepository.manager.delete(ProjectMember, {
      project: { id: projectId },
      user: { id: userId }
    });
    return result.affected !== 0;
  }

  async updateStatus(projectId: string, status: string): Promise<Project | null> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      return null;
    }
    project.status = status as ProjectStatus;
    await this.projectRepository.save(project);
    return project;
  }

  async updateProgress(projectId: string, progress: number): Promise<Project | null> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      return null;
    }
    project.progress = progress;
    await this.projectRepository.save(project);
    return project;
  }

  
}
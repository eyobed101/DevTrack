// src/modules/tasks/task.service.ts
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';
import { TaskStatus, TaskPriority } from './task.enum';

export class TaskService {
  constructor(
    private taskRepository: Repository<Task>,
    private userRepository: Repository<User>,
    private projectRepository: Repository<Project>
  ) {}

  async findAll(page: number, limit: number, projectId?: string): Promise<Task[]> {
    const where = projectId ? { project: { id: projectId } } : {};
    return this.taskRepository.find({
      where,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['project', 'assignee', 'reporter']
    });
  }

  async findById(id: string): Promise<Task | null> {
    return this.taskRepository.findOne({
      where: { id },
      relations: ['project', 'assignee', 'reporter']
    });
  }

  async create(createTaskDto: CreateTaskDto, reporterId: string): Promise<Task> {
    const project = await this.projectRepository.findOneBy({ id: createTaskDto.projectId });
    const reporter = await this.userRepository.findOneBy({ id: reporterId });

    if (!project || !reporter) {
      throw new Error('Project or reporter not found');
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      project,
      reporter,
      status: createTaskDto.status || TaskStatus.TODO,
      priority: createTaskDto.priority || TaskPriority.MEDIUM
    });

    return this.taskRepository.save(task);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) return null;

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.taskRepository.delete(id);
    return result.affected !== 0;
  }

  async assignTask(taskId: string, userId: string): Promise<Task | null> {
    const task = await this.taskRepository.findOneBy({ id: taskId });
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!task || !user) return null;

    task.assignee = user;
    return this.taskRepository.save(task);
  }
}
import { Request, Response } from 'express';
import { validate } from '../../../middlewares/validator';
import { TaskService } from '../task.service';
import { CreateTaskDto, UpdateTaskDto, AssignTaskDto } from '../task.dto';
import { AppDataSource } from '../../../config/database';
import { Task } from '../entities/task.entity';
import { logger } from '../../../config/logger';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    const taskRepository = AppDataSource.getRepository(Task);
    const userRepository = AppDataSource.getRepository(User);
    const projectRepository = AppDataSource.getRepository(Project);
    this.taskService = new TaskService(taskRepository, userRepository, projectRepository);

    this.getAllTasks = this.getAllTasks.bind(this);
    this.getTaskById = this.getTaskById.bind(this);
    this.createTask = this.createTask.bind(this);
    this.updateTask = this.updateTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.assignTask = this.assignTask.bind(this);
  }

  async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, projectId, status } = req.query;
      
      const tasks = await this.taskService.findAll(
        parseInt(page as string),
        parseInt(limit as string),
        projectId as string | undefined
      );
      
      res.status(200).json({
        success: true,
        data: tasks,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: tasks.length
        }
      });
    } catch (error) {
      logger.error('Error fetching tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tasks'
      });
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.taskService.findById(req.params.id);
      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      logger.error(`Error fetching task ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch task'
      });
    }
  }

  // @validate(CreateTaskDto)
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(400).json({
          success: false,
          message: 'Invalid user information'
        });
        return;
      }
      
      // Prepare task data with proper types
      const taskData = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        estimatedHours: req.body.estimatedHours ? parseFloat(req.body.estimatedHours) : null,
        labels: req.body.labels ? 
          (Array.isArray(req.body.labels) ? req.body.labels : [req.body.labels]) 
          : []
      };

      const task = await this.taskService.create(taskData);
      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully'
      });
    } catch (error) {
      logger.error('Error creating task:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Task creation failed'
      });
    }
  }

  // @validate(UpdateTaskDto)
  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const updateData = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
        estimatedHours: req.body.estimatedHours ? parseFloat(req.body.estimatedHours) : undefined,
        actualHours: req.body.actualHours ? parseFloat(req.body.actualHours) : undefined,
        labels: req.body.labels ? 
          (Array.isArray(req.body.labels) ? req.body.labels : [req.body.labels]) 
          : undefined
      };

      const task = await this.taskService.update(req.params.id, updateData);
      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: task,
        message: 'Task updated successfully'
      });
    } catch (error) {
      logger.error(`Error updating task ${req.params.id}:`, error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Task update failed'
      });
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.taskService.delete(req.params.id);
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      logger.error(`Error deleting task ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete task'
      });
    }
  }

  // @validate(AssignTaskDto)
  async assignTask(req: Request, res: Response): Promise<void> {
    try {
      const { userId, teamLeaderId } = req.body;
      
      if (!userId && !teamLeaderId) {
        res.status(400).json({
          success: false,
          message: 'Must provide at least one user ID (assignee or team leader)'
        });
        return;
      }
      
      const task = await this.taskService.assignTask(
        req.params.id, 
        userId
      );
      
      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task or user not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: task,
        message: 'Task assignment updated successfully'
      });
    } catch (error) {
      logger.error(`Error assigning task ${req.params.id}:`, error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Task assignment failed'
      });
    }
  }
}
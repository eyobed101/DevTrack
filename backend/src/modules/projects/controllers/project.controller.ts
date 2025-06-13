// src/modules/projects/project.controller.ts
import { Request, Response } from 'express';
import { validate } from '../../../middlewares/validator';
import { ProjectService } from '../project.service';

// Extend Express Request interface to include user with id
declare global {
  namespace Express {
    interface User {
      id: string;
      [key: string]: any;
    }
    interface Request {
      user?: User;
    }
  }
}
import { AppDataSource } from '../../../config/database';
import { Project } from '../entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { logger } from '../../../config/logger';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddMemberDto,
} from '../project.dto';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    const projectRepository = AppDataSource.getRepository(Project);
    const userRepository = AppDataSource.getRepository(User);
    this.projectService = new ProjectService(projectRepository, userRepository);

    this.getAllProjects = this.getAllProjects.bind(this);
    this.getProjectById = this.getProjectById.bind(this);
    this.createProject = this.createProject.bind(this);
    this.updateProject = this.updateProject.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.setProjectStatus = this.setProjectStatus.bind(this);
    this.updateProjectProgress = this.updateProjectProgress.bind(this);
  }

  async getAllProjects(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status, healthScore } = req.query;

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        healthScore: healthScore ? parseInt(healthScore as string) : undefined
      };

      const projects = await this.projectService.findAll(options.page, options.limit);
      res.status(200).json({
        success: true,
        data: projects,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: projects.length
        }
      });
    } catch (error) {
      logger.error('Error fetching projects:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch projects'
      });
    }
  }

  async getUserProjects(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const projects = await this.projectService.findUserProjects(
        req.user.id,
        options.page,
        options.limit
      );

      res.status(200).json({
        success: true,
        data: projects,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: projects.length
        }
      });
    } catch (error) {
      logger.error(`Error fetching projects for user ${req.user?.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user projects'
      });
    }
  }

  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const project = await this.projectService.findById(req.params.id);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: project
      });
    } catch (error) {
      logger.error(`Error fetching project ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch project'
      });
    }
  }

  // @validate(CreateProjectDto)
  async createProject(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || typeof req.user.id !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Invalid user information'
        });
        return;
      }

      const projectData = {
        ...req.body,
        // Convert dates to Date objects
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        // Convert tags to array if needed
        tags: Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags].filter(Boolean),
        // Set default values
        healthScore: req.body.healthScore || 50,
        progress: req.body.progress || 0
      };

      const project = await this.projectService.create(projectData, req.user.id);
      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully'
      });
    } catch (error) {
      logger.error('Error creating project:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Project creation failed'
      });
    }
  }

  // @validate(UpdateProjectDto)
  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const updateData = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        tags: req.body.tags ?
          (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags].filter(Boolean))
          : undefined
      };

      const project = await this.projectService.update(req.params.id, updateData);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: project,
        message: 'Project updated successfully'
      });
    } catch (error) {
      logger.error(`Error updating project ${req.params.id}:`, error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Project update failed'
      });
    }
  }

  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.projectService.delete(req.params.id);
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Project not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      logger.error(`Error deleting project ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete project'
      });
    }
  }

  // @validate(AddMemberDto)
  async addMember(req: Request, res: Response): Promise<void> {
    try {
      const { userId, role } = req.body;
      const result = await this.projectService.addMember(req.params.id, userId, role);
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Project or user not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Member added successfully'
      });
    } catch (error) {
      logger.error(`Error adding member to project ${req.params.id}:`, error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add member'
      });
    }
  }

  async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.projectService.removeMember(req.params.id, req.params.userId);
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Project, user or membership not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Member removed successfully'
      });
    } catch (error) {
      logger.error(`Error removing member from project ${req.params.id}:`, error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove member'
      });
    }
  }

  // @validate(SetProjectStatusDto)
  async setProjectStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const project = await this.projectService.updateStatus(req.params.id, status);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: project,
        message: 'Project status updated successfully'
      });
    } catch (error) {
      logger.error(`Error updating project status ${req.params.id}:`, error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update project status'
      });
    }
  }

  // @validate(UpdateProjectProgressDto)
  async updateProjectProgress(req: Request, res: Response): Promise<void> {
    try {
      const { progress } = req.body;
      const project = await this.projectService.updateProgress(req.params.id, progress);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: project,
        message: 'Project progress updated successfully'
      });
    } catch (error) {
      logger.error(`Error updating project progress ${req.params.id}:`, error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update project progress'
      });
    }
  }
}
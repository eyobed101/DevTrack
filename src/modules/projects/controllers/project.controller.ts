// src/modules/projects/project.controller.ts
import { Request, Response } from 'express';
import { validate } from '../../../middlewares/validator';
import { ProjectService } from '../project.service';
import { AppDataSource } from '../../../config/database';
import { Project } from '../entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { logger } from '../../../config/logger';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from '../project.dto';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    const projectRepository = AppDataSource.getRepository(Project);
    const userRepository = AppDataSource.getRepository(User);
    this.projectService = new ProjectService(projectRepository, userRepository);
  }

  async getAllProjects(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const projects = await this.projectService.findAll(
        parseInt(page as string),
        parseInt(limit as string)
      );
      res.status(200).json({
        success: true,
        data: projects,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
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
      if (!req.user || typeof req.user.id !== 'number') {
        res.status(400).json({
          success: false,
          message: 'Invalid user information'
        });
        return;
      }
      const project = await this.projectService.create(req.body, req.user.id.toString());
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
      const project = await this.projectService.update(req.params.id, req.body);
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
}
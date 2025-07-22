// src/modules/projects/project.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ProjectService } from '../project.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from '../project.dto';
import { Request } from 'express';

// Extend Express User type globally to include id
declare global {
  namespace Express {
    interface User {
      id: string;
      [key: string]: any;
    }
  }
}

interface AuthenticatedRequest extends Request {
  user: Express.User;
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getAllProjects(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('healthScore') healthScore?: number,
  ) {
    try {
      const projects = await this.projectService.findAll(page, limit);
      return {
        success: true,
        data: projects,
        pagination: {
          page,
          limit,
          total: projects.length,
        },
      };
    } catch (error) {
      console.log('Error fetching projects:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch projects',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user')
  async getUserProjects(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      if (!req.user?.id) {
        throw new HttpException(
          {
            success: false,
            message: 'Authentication required',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const projects = await this.projectService.findUserProjects(
        req.user.id,
        page,
        limit,
      );

      return {
        success: true,
        data: projects,
        pagination: {
          page,
          limit,
          total: projects.length,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch user projects',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getProjectById(@Param('id') id: string) {
    try {
      const project = await this.projectService.findById(id);
      if (!project) {
        throw new HttpException(
          {
            success: false,
            message: 'Project not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: project,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch project by id',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createProject(
    @Req() req: AuthenticatedRequest,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    try {
      console.log('Creating project with data:', createProjectDto);
      console.log('Authenticated user:', req.user);
      if (!req.user || typeof req.user.userId !== 'string') {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid user information',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const projectData = {
        ...createProjectDto,
        startDate: createProjectDto.startDate
          ? new Date(createProjectDto.startDate).toISOString()
          : undefined,
        endDate: createProjectDto.endDate
          ? new Date(createProjectDto.endDate).toISOString()
          : undefined,
        tags: Array.isArray(createProjectDto.tags)
          ? (createProjectDto.tags as string[]).filter((tag): tag is string => typeof tag === 'string')
          : typeof createProjectDto.tags === 'string'
            ? createProjectDto.tags
            : undefined,
        healthScore: createProjectDto.healthScore || 50,
        progress: createProjectDto.progress || 0,
      };

      const project = await this.projectService.create(projectData, req.user.id);
      return {
        success: true,
        data: project,
        message: 'Project created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error instanceof Error ? error.message : 'Project creation failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    try {
      const updateData = {
        ...updateProjectDto,
        startDate: updateProjectDto.startDate
          ? new Date(updateProjectDto.startDate)
          : undefined,
        endDate: updateProjectDto.endDate
          ? new Date(updateProjectDto.endDate)
          : undefined,
        tags: updateProjectDto.tags
          ? Array.isArray(updateProjectDto.tags)
            ? updateProjectDto.tags
            : [updateProjectDto.tags].filter(Boolean)
          : undefined,
      };

      const project = await this.projectService.update(id, updateData);
      if (!project) {
        throw new HttpException(
          {
            success: false,
            message: 'Project not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: project,
        message: 'Project updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error instanceof Error ? error.message : 'Project update failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string) {
    try {
      const result = await this.projectService.delete(id);
      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'Project not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        message: 'Project deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete project',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    try {
      const result = await this.projectService.addMember(
        id,
        addMemberDto.userId,
        addMemberDto.role,
      );
      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'Project or user not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        message: 'Member added successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error instanceof Error ? error.message : 'Failed to add member',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    try {
      const result = await this.projectService.removeMember(id, userId);
      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'Project, user or membership not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        message: 'Member removed successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error instanceof Error ? error.message : 'Failed to remove member',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id/status')
  async setProjectStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    try {
      const project = await this.projectService.updateStatus(id, status);
      if (!project) {
        throw new HttpException(
          {
            success: false,
            message: 'Project not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: project,
        message: 'Project status updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : 'Failed to update project status',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id/progress')
  async updateProjectProgress(
    @Param('id') id: string,
    @Body('progress') progress: number,
  ) {
    try {
      const project = await this.projectService.updateProgress(id, progress);
      if (!project) {
        throw new HttpException(
          {
            success: false,
            message: 'Project not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: project,
        message: 'Project progress updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : 'Failed to update project progress',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
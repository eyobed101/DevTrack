// src/modules/teams/team.controller.ts
import { Request, Response } from 'express';
import { validate } from '../../../middlewares/validator';
import { TeamService } from '../team.service';
// import { CreateTeamDto, UpdateTeamDto } from './team.dto';
import { AppDataSource } from '../../../config/database';
import { Team } from '../entities/team.entity';
import { logger } from '../../../config/logger';
import { User } from '../../users/entities/user.entity';

export class TeamController {
  private teamService: TeamService;

  constructor() {
    const teamRepository = AppDataSource.getRepository(Team);
    const userRepository = AppDataSource.getRepository(User);
    this.teamService = new TeamService(teamRepository, userRepository);
  }

  async getAllTeams(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const teams = await this.teamService.findAll(
        parseInt(page as string),
        parseInt(limit as string)
      );
       res.status(200).json({
        success: true,
        data: teams,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: teams.length
        }
      });
    } catch (error) {
      logger.error('Error fetching teams:', error);
       res.status(500).json({
        success: false,
        message: 'Failed to fetch teams'
      });
    }
  }

  async getTeamById(req: Request, res: Response): Promise<void> {
    try {
      const team = await this.teamService.findById(req.params.id);
      if (!team) {
         res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
       res.status(200).json({
        success: true,
        data: team
      });
    } catch (error) {
      logger.error(`Error fetching team ${req.params.id}:`, error);
       res.status(500).json({
        success: false,
        message: 'Failed to fetch team'
      });
    }
  }

//   @validate(CreateTeamDto)
  async createTeam(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || typeof req.user.id !== 'number') {
         res.status(400).json({
          success: false,
          message: 'Invalid user information'
        });
         return;
      }
      const team = await this.teamService.create(req.body, req.user.id.toString());
       res.status(201).json({
        success: true,
        data: team,
        message: 'Team created successfully'
      });
    } catch (error) {
      logger.error('Error creating team:', error);
       res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Team creation failed'
      });
    }
  }

//   @validate(UpdateTeamDto)
  async updateTeam(req: Request, res: Response): Promise<void> {
    try {
      const team = await this.teamService.update(req.params.id, req.body);
      if (!team) {
         res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
       res.status(200).json({
        success: true,
        data: team,
        message: 'Team updated successfully'
      });
    } catch (error) {
      logger.error(`Error updating team ${req.params.id}:`, error);
       res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Team update failed'
      });
    }
  }

  async deleteTeam(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.teamService.delete(req.params.id);
      if (!result) {
         res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
       res.status(200).json({
        success: true,
        message: 'Team deleted successfully'
      });
    } catch (error) {
      logger.error(`Error deleting team ${req.params.id}:`, error);
       res.status(500).json({
        success: false,
        message: 'Failed to delete team'
      });
    }
  }

  async addTeamMember(req: Request, res: Response): Promise<void> {
    try {
      const { userId, role } = req.body;
      const result = await this.teamService.addMember(req.params.id, userId, role);
      if (!result) {
         res.status(404).json({
          success: false,
          message: 'Team or user not found'
        });
      }
       res.status(200).json({
        success: true,
        message: 'Member added successfully'
      });
    } catch (error) {
      logger.error(`Error adding member to team ${req.params.id}:`, error);
       res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add member'
      });
    }
  }
}
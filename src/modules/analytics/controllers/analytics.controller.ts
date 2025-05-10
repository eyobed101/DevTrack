// src/modules/analytics/analytics.controller.ts
import { Request, Response } from 'express';
import { AnalyticsService } from '../analytics.service';
import { AppDataSource } from '../../../config/database';
import { TimeTracking } from '../entities/time-tracking.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';
import { logger } from '../../../config/logger';
import { validate } from '../../../middlewares/validator';
import { GetAnalyticsDto } from '../analytics.dto';
import { authenticate } from '../../../middlewares/authenticate';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    const timeTrackingRepository = AppDataSource.getRepository(TimeTracking);
    const taskRepository = AppDataSource.getRepository(Task);
    const userRepository = AppDataSource.getRepository(User);
    this.analyticsService = new AnalyticsService(
      timeTrackingRepository,
      taskRepository,
      userRepository,
    
    );
  }

//   @authenticate
//   @validate(GetAnalyticsDto)
  async getProductivityAnalytics(req: Request, res: Response): Promise<void> {
    try {

      const { projectId, startDate, endDate } = req.query;
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized: User information is missing'
        });
        return;
      }

      const analytics = await this.analyticsService.getProductivityMetrics({
        userId : req.user.id.toString(),
        projectId: projectId as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined
      });

      res.status(200).json({
        success: true,
        data: analytics,
        message: 'Productivity analytics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching productivity analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch productivity analytics'
      });
    }
  }

//   @authenticate
//   @validate(GetAnalyticsDto)
  async getTimeTrackingAnalytics(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({
              success: false,
              message: 'Unauthorized: User information is missing'
            });
            return;
          }
      const { projectId, startDate, endDate } = req.query;
      const userId = req.user.id.toString();

      const analytics = await this.analyticsService.getTimeTrackingMetrics({
        userId,
        projectId: projectId as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined
      });

      res.status(200).json({
        success: true,
        data: analytics,
        message: 'Time tracking analytics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching time tracking analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch time tracking analytics'
      });
    }
  }

//   @authenticate
//   @validate(GetAnalyticsDto)
  async getTeamPerformance(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({
              success: false,
              message: 'Unauthorized: User information is missing'
            });
            return;
          }
      const { projectId, startDate, endDate } = req.query;
      const userId = req.user.id.toString();

      const analytics = await this.analyticsService.getTeamPerformanceMetrics({
        userId,
        projectId: projectId as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined
      });

      res.status(200).json({
        success: true,
        data: analytics,
        message: 'Team performance analytics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching team performance analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch team performance analytics'
      });
    }
  }
}
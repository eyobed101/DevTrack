// src/modules/reports/report.controller.ts
import { Request, Response } from 'express';
import { ReportService } from '../report.service';
import { AppDataSource } from '../../../config/database';
import { Report } from '../entities/report.entity';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { logger } from '../../../config/logger';
import { validate } from '../../../middlewares/validator';
import { GenerateReportDto, ExportReportDto } from '../report.dto';
import { ReportType, ExportFormat } from '../report.enum';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    const reportRepository = AppDataSource.getRepository(Report);
    const userRepository = AppDataSource.getRepository(User);
    const projectRepository = AppDataSource.getRepository(Project);
    this.reportService = new ReportService(reportRepository, userRepository, projectRepository);
    
    this.getAllReports = this.getAllReports.bind(this);
    this.generateReport = this.generateReport.bind(this);
    this.exportReport = this.exportReport.bind(this);
    this.getContentType = this.getContentType.bind(this);
  
  }

  async getAllReports(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, projectId } = req.query;
      const reports = await this.reportService.findAll(
        parseInt(page as string),
        parseInt(limit as string),
        projectId as string | undefined
      );
      res.status(200).json({
        success: true,
        data: reports,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: reports.length
        }
      });
    } catch (error) {
      logger.error('Error fetching reports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reports'
      });
    }
  }

//   @validate(GenerateReportDto)
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await this.reportService.generate(
        req.body.type,
        req.body.projectId,
        req.user?.id?.toString() || '',
        req.body.filters
      );
      res.status(201).json({
        success: true,
        data: report,
        message: 'Report generated successfully'
      });
    } catch (error) {
      logger.error('Error generating report:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Report generation failed'
      });
    }
  }

//   @validate(ExportReportDto)
  async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const { format, reportId } = req.body;
      const result = await this.reportService.export(reportId, format);

      // Set appropriate headers based on format
      const contentType = this.getContentType(format);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=report_${reportId}.${format.toLowerCase()}`);

      // Send the file
      res.status(200).send(result);
    } catch (error) {
      logger.error('Error exporting report:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Report export failed'
      });
    }
  }

  private getContentType(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.PDF:
        return 'application/pdf';
      case ExportFormat.CSV:
        return 'text/csv';
      case ExportFormat.EXCEL:
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case ExportFormat.JSON:
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}
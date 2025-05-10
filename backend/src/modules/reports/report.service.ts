import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { ReportType, ReportStatus } from './report.enum';
import { logger } from '../../config/logger';
import { ExportFormat } from './report.enum';
import { generatePdf } from '../../common/utils/pdf-generator';
import { generateExcel } from '../../common/utils/excel-generator';
import { jsonToCsv } from '../../common/utils/csv-generator';

export class ReportService {
  constructor(
    private reportRepository: Repository<Report>,
    private userRepository: Repository<User>,
    private projectRepository: Repository<Project>
  ) {}

  async findAll(page: number, limit: number, projectId?: string): Promise<Report[]> {
    const where = projectId ? { project: { id: projectId } } : {};
    return this.reportRepository.find({
      where,
      relations: ['project', 'generatedBy'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });
  }

  async generate(
    type: ReportType,
    projectId: string,
    userId: string,
    filters?: Record<string, any>
  ): Promise<Report> {
    const project = await this.projectRepository.findOneBy({ id: projectId });
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!project || !user) {
      throw new Error('Project or user not found');
    }

    const report = this.reportRepository.create({
      type,
      project,
      generatedBy: user,
      filters,
      status: ReportStatus.PENDING
    });

    const savedReport = await this.reportRepository.save(report);

    // Process report generation in background
    this.processReport(savedReport.id).catch((error) => {
      logger.error(`Failed to process report ${savedReport.id}:`, error);
    });

    return savedReport;
  }

  private async processReport(reportId: string): Promise<void> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: ['project']
    });

    if (!report) return;

    try {
      // Simulate report generation (replace with actual logic)
      const data = await this.generateReportData(report.type, report.project.id, report.filters ?? undefined);
      
      report.data = data;
      report.status = ReportStatus.GENERATED;
      report.generatedAt = new Date();
      await this.reportRepository.save(report);
    } catch (error) {
      report.status = ReportStatus.FAILED;
      await this.reportRepository.save(report);
      throw error;
    }
  }

  async export(reportId: string, format: ExportFormat): Promise<Buffer | string> {
    const report = await this.reportRepository.findOneBy({ id: reportId });
    if (!report || !report.data) {
      throw new Error('Report not found or not generated');
    }

    switch (format) {
      case ExportFormat.PDF:
        return generatePdf(report.data);
      case ExportFormat.CSV:
        return jsonToCsv(report.data);
      case ExportFormat.EXCEL:
        return generateExcel(report.data);
      case ExportFormat.JSON:
        return JSON.stringify(report.data);
      default:
        throw new Error('Unsupported export format');
    }
  }

  private async generateReportData(
    type: ReportType,
    projectId: string,
    filters?: Record<string, any>
  ): Promise<any> {
    // Implement actual report data generation based on type
    // This would query your database and aggregate data
    return {
      type,
      projectId,
      filters,
      generatedAt: new Date().toISOString(),
      // Sample data structure - customize per report type
      metrics: {
        completedTasks: 42,
        pendingTasks: 8,
        overdueTasks: 3
      }
    };
  }
}
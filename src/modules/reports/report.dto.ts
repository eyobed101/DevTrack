import { IsEnum, IsOptional, IsString, IsUUID, IsObject } from 'class-validator';
import { ReportType, ExportFormat } from './report.enum';

export class GenerateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsUUID()
  projectId: string;

  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;
}

export class ExportReportDto {
  @IsUUID()
  reportId: string;

  @IsEnum(ExportFormat)
  format: ExportFormat;
}
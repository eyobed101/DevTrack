import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class GetAnalyticsDto {
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
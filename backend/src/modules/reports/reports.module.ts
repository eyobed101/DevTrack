import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { ReportService } from './report.service';
import { ReportController } from './controllers/report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, Project])],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportsModule {}
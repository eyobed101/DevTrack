import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ProjectRole } from './project.enum';

export class CreateProjectDto {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[] | string;
  healthScore?: number;
  progress?: number;
}

// export class UpdateProjectDto {
//   @IsString()
//   @IsOptional()
//   name?: string;

//   @IsString()
//   @IsOptional()
//   description?: string;
// }

export class UpdateProjectDto {
  readonly name?: string;
  readonly description?: string;
  readonly tags?: string[] | string;
  readonly status?: string;
  readonly healthScore?: number;
  readonly progress?: number;
  readonly startDate?: Date | string;
  readonly endDate?: Date | string;
}

export class AddMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role: ProjectRole;
}
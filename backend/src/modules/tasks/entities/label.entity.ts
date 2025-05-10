// src/modules/tasks/entities/label.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { TaskLabelColor } from '../task.enum';

@Entity()
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: TaskLabelColor,
    default: TaskLabelColor.BLUE
  })
  color: TaskLabelColor;

  @ManyToOne(() => Project, (project) => project.labels)
  project: Project;
}
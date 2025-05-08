import { Repository, Between } from 'typeorm';
import { TimeTracking } from './entities/time-tracking.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';

interface AnalyticsParams {
  userId: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

export class AnalyticsService {
  constructor(
    private timeTrackingRepository: Repository<TimeTracking>,
    private taskRepository: Repository<Task>,
    private userRepository: Repository<User>
  ) {}

  async getProductivityMetrics(params: AnalyticsParams): Promise<any> {
    const { userId, projectId, startDate, endDate } = params;
    const where: any = { user: { id: userId } };

    if (projectId) where.project = { id: projectId };
    if (startDate && endDate) {
      where.startTime = Between(new Date(startDate), new Date(endDate));
    }

    // Get completed tasks
    const completedTasks = await this.taskRepository.count({
      where: {
        ...where,
        status: 'done'
      }
    });

    // Get total tasks
    const totalTasks = await this.taskRepository.count({ where });

    // Calculate productivity score
    const productivityScore = totalTasks > 0 
      ? (completedTasks / totalTasks) * 100 
      : 0;

    return {
      completedTasks,
      totalTasks,
      productivityScore: Math.round(productivityScore),
      metrics: await this.getAdditionalProductivityMetrics(where)
    };
  }

  async getTimeTrackingMetrics(params: AnalyticsParams): Promise<any> {
    const { userId, projectId, startDate, endDate } = params;
    const where: any = { user: { id: userId } };

    if (projectId) where.project = { id: projectId };
    if (startDate && endDate) {
      where.startTime = Between(new Date(startDate), new Date(endDate));
    }

    const timeEntries = await this.timeTrackingRepository.find({
      where,
      relations: ['task', 'project']
    });

    const totalHours = timeEntries.reduce((sum, entry) => {
      return sum + (entry.duration || 0);
    }, 0) / 60; // Convert minutes to hours

    return {
      totalHours: parseFloat(totalHours.toFixed(2)),
      dailyAverage: await this.calculateDailyAverage(timeEntries),
      byTask: this.groupByTask(timeEntries),
      byProject: this.groupByProject(timeEntries)
    };
  }

//   async getTeamPerformanceMetrics(params: AnalyticsParams): Promise<any> {
//     // Implementation for team performance analytics
//     // Would include metrics like:
//     // - Team velocity
//     // - Burndown charts
//     // - Individual contributions
//     // - Task completion rates
//   }

//   private async getAdditionalProductivityMetrics(where: any): Promise<any> {
//     // Implement additional metrics like:
//     // - Tasks completed on time vs overdue
//     // - Time estimates vs actual time spent
//     // - Task priority distribution
//   }

private async calculateDailyAverage(timeEntries: TimeTracking[]): Promise<number> {
    if (timeEntries.length === 0) return 0;

    // Calculate total duration in hours
    const totalHours = timeEntries.reduce((sum, entry) => {
      return sum + (entry.duration || 0);
    }, 0) / 60;

    // Find date range
    const dates = timeEntries.map(entry => entry.startTime);
    const minDate = new Date(Math.min(...dates.map(date => date.getTime())));
    const maxDate = new Date(Math.max(...dates.map(date => date.getTime())));

    // Calculate number of days (at least 1)
    const days = Math.max(
      1,
      Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    return parseFloat((totalHours / days).toFixed(2));
}

private groupByTask(timeEntries: TimeTracking[]): Array<{
    taskId: string | null;
    taskName: string;
    totalHours: number;
    entries: TimeTracking[];
}> {
    const taskMap = new Map<string | null, {
        taskId: string | null;
        taskName: string;
        totalHours: number;
        entries: TimeTracking[];
    }>();

    // Initialize with null for entries without tasks
    taskMap.set(null, {
        taskId: null,
        taskName: 'No Task',
        totalHours: 0,
        entries: []
    });

    for (const entry of timeEntries) {
        const taskId = entry.task?.id || null;
        const taskName = entry.task?.title || 'No Task';
        const durationHours = (entry.duration || 0) / 60;

        if (!taskMap.has(taskId)) {
            taskMap.set(taskId, {
                taskId,
                taskName,
                totalHours: 0,
                entries: []
            });
        }

        const taskData = taskMap.get(taskId)!;
        taskData.totalHours += durationHours;
        taskData.entries.push(entry);
    }

    return Array.from(taskMap.values())
        .sort((a, b) => b.totalHours - a.totalHours)
        .map(item => ({
            ...item,
            totalHours: parseFloat(item.totalHours.toFixed(2))
        }));
}

private groupByProject(timeEntries: TimeTracking[]): Array<{
    projectId: string | null;
    projectName: string;
    totalHours: number;
    tasks: Array<{
        taskId: string | null;
        taskName: string;
        totalHours: number;
    }>;
}> {
    const projectMap = new Map<string | null, {
        projectId: string | null;
        projectName: string;
        totalHours: number;
        tasks: Map<string | null, {
            taskId: string | null;
            taskName: string;
            totalHours: number;
        }>;
    }>();

    // Initialize with null for entries without projects
    projectMap.set(null, {
        projectId: null,
        projectName: 'No Project',
        totalHours: 0,
        tasks: new Map()
    });

    for (const entry of timeEntries) {
        const projectId = entry.project?.id || null;
        const projectName = entry.project?.name || 'No Project';
        const taskId = entry.task?.id || null;
        const taskName = entry.task?.title || 'No Task';
        const durationHours = (entry.duration || 0) / 60;

        if (!projectMap.has(projectId)) {
            projectMap.set(projectId, {
                projectId,
                projectName,
                totalHours: 0,
                tasks: new Map()
            });
        }

        const projectData = projectMap.get(projectId)!;
        projectData.totalHours += durationHours;

        if (!projectData.tasks.has(taskId)) {
            projectData.tasks.set(taskId, {
                taskId,
                taskName,
                totalHours: 0
            });
        }

        const taskData = projectData.tasks.get(taskId)!;
        taskData.totalHours += durationHours;
    }

    return Array.from(projectMap.values())
        .sort((a, b) => b.totalHours - a.totalHours)
        .map(project => ({
            projectId: project.projectId,
            projectName: project.projectName,
            totalHours: parseFloat(project.totalHours.toFixed(2)),
            tasks: Array.from(project.tasks.values())
                .sort((a, b) => b.totalHours - a.totalHours)
                .map(task => ({
                    ...task,
                    totalHours: parseFloat(task.totalHours.toFixed(2))
                }))
        }));
}
}
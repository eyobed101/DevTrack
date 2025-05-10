import { Repository, Between } from 'typeorm';
import { TimeTracking } from './entities/time-tracking.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { TaskStatus } from '../tasks/task.enum';

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

async getTeamPerformanceMetrics(params: AnalyticsParams): Promise<any> {
    const { projectId, startDate, endDate } = params;
    const where: any = {};

    if (projectId) where.project = { id: projectId };
    if (startDate && endDate) {
        where.startTime = Between(new Date(startDate), new Date(endDate));
    }

    // Get all team members working on the project/filtered period
    const teamMembers = await this.userRepository.find({
        where: projectId ? { projects: { id: projectId } } : {},
        relations: ['assignedTasks', 'reportedTasks']
    });

    // Get all relevant tasks and time tracking data
    const tasks = await this.taskRepository.find({
        where,
        relations: ['assignee', 'timeEntries']
    });

    const timeEntries = await this.timeTrackingRepository.find({
        where,
        relations: ['user', 'task']
    });

    // Calculate metrics per team member
    const memberMetrics = teamMembers.map(member => {
        const memberTasks = tasks.filter(task => task.assignee?.id === member.id);
        const completedTasks = memberTasks.filter(task => task.status === TaskStatus.DONE);
        const memberTimeEntries = timeEntries.filter(entry => entry.user?.id === member.id);
        
        const totalHoursWorked = memberTimeEntries.reduce((sum, entry) => 
            sum + (entry.duration || 0), 0) / 60;

        const taskCompletionRate = memberTasks.length > 0
            ? (completedTasks.length / memberTasks.length) * 100
            : 0;

        return {
            userId: member.id,
            userName: `${member.firstName} ${member.lastName}`,
            avatar: member.avatarUrl,
            totalTasks: memberTasks.length,
            completedTasks: completedTasks.length,
            completionRate: Math.round(taskCompletionRate),
            hoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
            avgHoursPerTask: memberTasks.length > 0
                ? parseFloat((totalHoursWorked / memberTasks.length).toFixed(2))
                : 0
        };
    });

    // Calculate team-wide metrics
    const completedTasks = tasks.filter(task => task.status === TaskStatus.DONE);
    const totalHoursWorked = timeEntries.reduce((sum, entry) => 
        sum + (entry.duration || 0), 0) / 60;
    
    const velocity = completedTasks.length; // Simple velocity metric
    const avgCompletionRate = teamMembers.length > 0
        ? memberMetrics.reduce((sum, member) => sum + member.completionRate, 0) / teamMembers.length
        : 0;

    // Generate weekly burndown data
    const burndownData = this.generateBurndownData(tasks, timeEntries, startDate, endDate);

    return {
        teamMetrics: {
            totalMembers: teamMembers.length,
            totalTasks: tasks.length,
            completedTasks: completedTasks.length,
            completionRate: Math.round(avgCompletionRate),
            totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
            velocity,
            burndownData
        },
        memberMetrics: memberMetrics.sort((a, b) => b.completionRate - a.completionRate)
    };
}

private generateBurndownData(tasks: Task[], timeEntries: TimeTracking[], startDate?: string, endDate?: string) {
    if (!startDate || !endDate) return [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Initialize burndown data
    const burndownData = [];
    let remainingTasks = tasks.length;
    let idealBurnRate = tasks.length / daysDiff;

    for (let i = 0; i <= daysDiff; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        
        // Format date for display
        const dateLabel = currentDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });

        // Calculate tasks completed by this date
        const completedByDate = tasks.filter(task => 
            task.status === TaskStatus.DONE && 
            task.updatedAt && 
            new Date(task.updatedAt) <= currentDate
        ).length;

        // Calculate actual remaining tasks
        const actualRemaining = tasks.length - completedByDate;

        // Calculate ideal remaining
        const idealRemaining = Math.max(0, tasks.length - (idealBurnRate * i));

        burndownData.push({
            date: dateLabel,
            actual: actualRemaining,
            ideal: Math.round(idealRemaining),
            completed: completedByDate
        });
    }

    return burndownData;
}

private async getAdditionalProductivityMetrics(where: any): Promise<any> {
    // Get all tasks for the given filters
    const tasks = await this.taskRepository.find({
        where,
        relations: ['timeEntries']
    });

    // Metrics for tasks completed vs not completed
    const completedTasks = tasks.filter(task => task.status === TaskStatus.DONE);
    const incompleteTasks = tasks.filter(task => task.status !== TaskStatus.DONE);

    // Time estimates vs actual time spent
    let totalEstimatedHours = 0;
    let totalActualHours = 0;
    const tasksWithTimeComparison = [];

    for (const task of tasks) {
        const estimated = task.estimatedHours || 0;
        const actual = task.actualHours || 
                      (task.timeEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60 || 0);
        
        totalEstimatedHours += estimated;
        totalActualHours += actual;

        tasksWithTimeComparison.push({
            taskId: task.id,
            taskTitle: task.title,
            estimatedHours: estimated,
            actualHours: parseFloat(actual.toFixed(2)),
            difference: parseFloat((actual - estimated).toFixed(2)),
            differencePercentage: estimated > 0 
                ? Math.round(((actual - estimated) / estimated) * 100) 
                : 0
        });
    }

    // Task status distribution
    const statusCounts = {
        [TaskStatus.TODO]: tasks.filter(t => t.status === TaskStatus.TODO).length,
        [TaskStatus.IN_PROGRESS]: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        [TaskStatus.IN_REVIEW]: tasks.filter(t => t.status === TaskStatus.IN_REVIEW).length,
        [TaskStatus.DONE]: completedTasks.length,
        [TaskStatus.BLOCKED]: tasks.filter(t => t.status === TaskStatus.BLOCKED).length
    };

    return {
        completionMetrics: {
            totalTasks: tasks.length,
            completedTasks: completedTasks.length,
            incompleteTasks: incompleteTasks.length,
            completionRate: tasks.length > 0 
                ? Math.round((completedTasks.length / tasks.length) * 100) 
                : 0
        },
        timeComparison: {
            totalEstimatedHours: parseFloat(totalEstimatedHours.toFixed(2)),
            totalActualHours: parseFloat(totalActualHours.toFixed(2)),
            timeDifference: parseFloat((totalActualHours - totalEstimatedHours).toFixed(2)),
            timeDifferencePercentage: totalEstimatedHours > 0 
                ? Math.round(((totalActualHours - totalEstimatedHours) / totalEstimatedHours) * 100) 
                : 0,
            tasks: tasksWithTimeComparison
        },
        statusDistribution: {
            ...statusCounts,
            total: tasks.length
        }
    };
}

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
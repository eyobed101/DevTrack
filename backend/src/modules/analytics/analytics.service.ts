import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { TimeTracking } from './entities/time-tracking.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { 
  TaskTimeSummary, 
  ProjectTimeSummary,
  ProductivityMetrics,
  DailyTrend,
  AnalyticsParams,
  BurndownChartData,
  TeamMemberContribution,
  TeamPerformanceMetrics

} from './analytics.types';

export class AnalyticsService {
  constructor(
    private timeTrackingRepository: Repository<TimeTracking>,
    private taskRepository: Repository<Task>,
    private userRepository: Repository<User>
  ) {}

  async getTeamPerformanceMetrics(params: AnalyticsParams): Promise<{
    teamVelocity: number;
    burndown: BurndownChartData[];
    individualContributions: TeamMemberContribution[];
    completionRates: {
      total: number;
      completed: number;
      percentage: number;
    };
  }> {
    const { projectId, startDate, endDate } = params;
    const where: any = {};
    
    if (projectId) where.project = { id: projectId };
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }
  
    // Get all relevant tasks and time entries
    const [tasks, timeEntries] = await Promise.all([
      this.taskRepository.find({
        where,
        relations: ['assignee', 'timeEntries']
      }),
      this.timeTrackingRepository.find({
        where,
        relations: ['user', 'task']
      })
    ]);
  
    if (tasks.length === 0) {
      return {
        teamVelocity: 0,
        burndown: this.generateEmptyBurndownChart(startDate, endDate),
        individualContributions: [],
        completionRates: {
          total: 0,
          completed: 0,
          percentage: 0
        }
      };
    }
  
    // Calculate team velocity (completed tasks per time period)
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate must be defined');
    }
    const teamVelocity = this.calculateTeamVelocity(tasks, startDate, endDate);
  
    // Generate burndown chart data
    const burndown = this.generateBurndownChart(tasks, startDate, endDate);
  
    // Calculate individual contributions
    const individualContributions = this.calculateIndividualContributions(timeEntries);
  
    // Calculate completion rates
    const completionRates = this.calculateCompletionRates(tasks);
  
    return {
      teamVelocity,
      burndown,
      individualContributions,
      completionRates
    };
  }
  private calculateTeamVelocity(tasks: Task[], startDate: string, endDate: string): number {
    const completedTasks = tasks.filter(t => t.status === 'done');
    const daysInPeriod = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    ) || 1; // Avoid division by zero
    
    return parseFloat((completedTasks.length / daysInPeriod).toFixed(2));
  }
  
  private generateBurndownChart(tasks: Task[], startDate: string, endDate: string): BurndownChartData[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalTasks = tasks.length;
    
    const burndownData: BurndownChartData[] = [];
    let completedTasks = 0;
  
    // Initialize with all dates in the period
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      burndownData.push({
        date: dateStr,
        ideal: this.calculateIdealBurndown(totalTasks, totalDays, start, d),
        actual: 0,
        tasksRemaining: 0
      });
    }
  
    // Process completed tasks
    tasks
      .filter(t => t.status === 'done' && t.updatedAt)
      .forEach(task => {
        const completionDate = task.updatedAt.toISOString().split('T')[0];
        const dayData = burndownData.find(d => d.date === completionDate);
        if (dayData) {
          dayData.actual++;
          completedTasks++;
        }
      });
  
    // Calculate remaining tasks for each day
    let runningCompleted = 0;
    for (const day of burndownData) {
      runningCompleted += day.actual;
      day.tasksRemaining = totalTasks - runningCompleted;
    }
  
    return burndownData;
  }
  
  private calculateIdealBurndown(totalTasks: number, totalDays: number, startDate: Date, currentDate: Date): number {
    const daysPassed = Math.ceil(
      (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.round((totalTasks / totalDays) * daysPassed);
  }
  
  private calculateIndividualContributions(timeEntries: TimeTracking[]): TeamMemberContribution[] {
    const userMap = new Map<string, {
      userId: string;
      userName: string;
      avatarUrl?: string;
      hoursLogged: number;
      tasksCompleted: number;
    }>();
  
    // Group by user
    timeEntries.forEach(entry => {
      if (!userMap.has(entry.user.id)) {
        userMap.set(entry.user.id, {
          userId: entry.user.id,
          userName: `${entry.user.firstName} ${entry.user.lastName}`,
          avatarUrl: entry.user.avatarUrl,
          hoursLogged: 0,
          tasksCompleted: 0
        });
      }
      const userData = userMap.get(entry.user.id)!;
      userData.hoursLogged += (entry.duration || 0) / 60; // Convert to hours
    });
  
    // Count completed tasks per user
    const completedTasks = timeEntries
      .filter(entry => entry.task?.status === 'done')
      .map(entry => entry.user.id);
  
    completedTasks.forEach(userId => {
      if (userMap.has(userId)) {
        userMap.get(userId)!.tasksCompleted++;
      }
    });
  
    // Calculate total hours for percentages
    const totalHours = Array.from(userMap.values())
      .reduce((sum, user) => sum + user.hoursLogged, 0);
  
    // Convert to array and add percentages
    return Array.from(userMap.values())
      .map(user => ({
        ...user,
        hoursLogged: parseFloat(user.hoursLogged.toFixed(2)),
        contributionPercentage: totalHours > 0
          ? parseFloat(((user.hoursLogged / totalHours) * 100).toFixed(2))
          : 0
      }))
      .sort((a, b) => b.hoursLogged - a.hoursLogged);
  }
  
  private calculateCompletionRates(tasks: Task[]): {
    total: number;
    completed: number;
    percentage: number;
  } {
    const completed = tasks.filter(t => t.status === 'done').length;
    return {
      total: tasks.length,
      completed,
      percentage: tasks.length > 0
        ? parseFloat(((completed / tasks.length) * 100).toFixed(2))
        : 0
    };
  }
  
  private generateEmptyBurndownChart(startDate?: string, endDate?: string): BurndownChartData[] {
    if (!startDate || !endDate) return [];
    
    const burndownData: BurndownChartData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      burndownData.push({
        date: d.toISOString().split('T')[0],
        ideal: 0,
        actual: 0,
        tasksRemaining: 0
      });
    }
  
    return burndownData;
  }
  
  
  async getProductivityMetrics(params: AnalyticsParams): Promise<{
    completedTasks: number;
    totalTasks: number;
    productivityScore: number;
    metrics: ProductivityMetrics;
  }> {
    const { userId, projectId, startDate, endDate } = params;
    const where: any = { user: { id: userId } };

    if (projectId) where.project = { id: projectId };
    if (startDate && endDate) {
      where.startTime = Between(new Date(startDate), new Date(endDate));
    }

    const completedTasks = await this.taskRepository.count({
      where: {
        ...where,
        status: 'done'
      }
    });

    const totalTasks = await this.taskRepository.count({ where });
    const productivityScore = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    return {
      completedTasks,
      totalTasks,
      productivityScore,
      metrics: await this.getAdditionalProductivityMetrics(where)
    };
  }

  async getTimeTrackingMetrics(params: AnalyticsParams): Promise<{
    totalHours: number;
    dailyAverage: number;
    byTask: TaskTimeSummary[];
    byProject: ProjectTimeSummary[];
  }> {
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

    const totalHours = parseFloat((
      timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60
    ).toFixed(2));

    return {
      totalHours,
      dailyAverage: await this.calculateDailyAverage(timeEntries),
      byTask: this.groupByTask(timeEntries),
      byProject: this.groupByProject(timeEntries)
    };
  }

  

  private async getAdditionalProductivityMetrics(where: any): Promise<ProductivityMetrics> {
    const tasks = await this.taskRepository.find({
      where,
      relations: ['timeEntries']
    });

    if (tasks.length === 0) {
      return this.getEmptyProductivityMetrics();
    }

    const completedTasks = tasks.filter(task => task.status === 'done');
    const onTimeCompletionRate = this.calculateOnTimeCompletionRate(completedTasks);
    const overdueTasks = this.countOverdueTasks(tasks);
    const timeEstimateAccuracy = this.calculateTimeEstimateAccuracy(tasks);
    const priorityDistribution = this.getPriorityDistribution(tasks);
    const dailyTrends = this.calculateDailyTrends(tasks);

    return {
      onTimeCompletionRate,
      overdueTasks,
      timeEstimateAccuracy: Math.round(timeEstimateAccuracy),
      priorityDistribution,
      dailyTrends
    };
  }

  private getEmptyProductivityMetrics(): ProductivityMetrics {
    return {
      onTimeCompletionRate: 0,
      overdueTasks: 0,
      timeEstimateAccuracy: 0,
      priorityDistribution: { high: 0, medium: 0, low: 0 },
      dailyTrends: []
    };
  }

  private calculateOnTimeCompletionRate(completedTasks: Task[]): number {
    const onTimeTasks = completedTasks.filter(task => 
      !task.dueDate || new Date(task.dueDate) >= new Date(task.updatedAt)
    );
    return completedTasks.length > 0
      ? Math.round((onTimeTasks.length / completedTasks.length) * 100)
      : 0;
  }

  private countOverdueTasks(tasks: Task[]): number {
    return tasks.filter(task => 
      task.dueDate && 
      task.status !== 'done' && 
      new Date(task.dueDate) < new Date()
    ).length;
  }

  private calculateTimeEstimateAccuracy(tasks: Task[]): number {
    let totalEstimateDiff = 0;
    let tasksWithEstimates = 0;
    
    tasks.forEach(task => {
      if (task.estimatedHours && task.timeEntries?.length > 0) {
        const actualHours = task.timeEntries.reduce(
          (sum, entry) => sum + (entry.duration || 0), 0) / 60;
        totalEstimateDiff += Math.abs(task.estimatedHours - actualHours);
        tasksWithEstimates++;
      }
    });
    
    return tasksWithEstimates > 0
      ? Math.max(0, 100 - (totalEstimateDiff / tasksWithEstimates) * 100)
      : 0;
  }

  private getPriorityDistribution(tasks: Task[]): { high: number; medium: number; low: number } {
    return {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };
  }

  private calculateDailyTrends(tasks: Task[]): DailyTrend[] {
    const trendsMap = new Map<string, { completed: number; created: number }>();
    const dateRange = this.getLast14DaysRange();

    dateRange.forEach(dateStr => {
      trendsMap.set(dateStr, { completed: 0, created: 0 });
    });

    tasks.forEach(task => {
      const createdDate = task.createdAt.toISOString().split('T')[0];
      if (trendsMap.has(createdDate)) {
        trendsMap.get(createdDate)!.created++;
      }

      if (task.status === 'done') {
        const completedDate = task.updatedAt.toISOString().split('T')[0];
        if (trendsMap.has(completedDate)) {
          trendsMap.get(completedDate)!.completed++;
        }
      }
    });

    return this.sortAndFormatTrends(trendsMap);
  }

  private getLast14DaysRange(): string[] {
    const dates: string[] = [];
    const today = new Date();
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13); // Inclusive of today

    for (let d = new Date(fourteenDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates;
  }

  private sortAndFormatTrends(
    trendsMap: Map<string, { completed: number; created: number }>
  ): DailyTrend[] {
    return Array.from(trendsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, counts]) => ({
        date,
        completed: counts.completed,
        created: counts.created
      }));
  }

  private async calculateDailyAverage(timeEntries: TimeTracking[]): Promise<number> {
    if (timeEntries.length === 0) return 0;

    const totalHours = timeEntries.reduce((sum, entry) => 
      sum + (entry.duration || 0), 0) / 60;
    const days = this.calculateDateRangeDays(timeEntries);

    return parseFloat((totalHours / days).toFixed(2));
  }

  private calculateDateRangeDays(timeEntries: TimeTracking[]): number {
    const dates = timeEntries.map(entry => entry.startTime);
    const minDate = new Date(Math.min(...dates.map(date => date.getTime())));
    const maxDate = new Date(Math.max(...dates.map(date => date.getTime())));

    return Math.max(
      1,
      Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
    );
  }

  private groupByTask(timeEntries: TimeTracking[]): TaskTimeSummary[] {
    const taskMap = new Map<string | null, TaskTimeSummary>();

    // Initialize with null for entries without tasks
    taskMap.set(null, {
      taskId: null,
      taskName: 'No Task',
      totalHours: 0,
      entries: []
    });

    timeEntries.forEach(entry => {
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
    });

    return this.sortAndFormatTaskSummaries(taskMap);
  }

  private sortAndFormatTaskSummaries(
    taskMap: Map<string | null, TaskTimeSummary>
  ): TaskTimeSummary[] {
    return Array.from(taskMap.values())
      .sort((a, b) => b.totalHours - a.totalHours)
      .map(item => ({
        ...item,
        totalHours: parseFloat(item.totalHours.toFixed(2))
      }));
  }

  private groupByProject(timeEntries: TimeTracking[]): ProjectTimeSummary[] {
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

    timeEntries.forEach(entry => {
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
    });

    return this.sortAndFormatProjectSummaries(projectMap);
  }

  private sortAndFormatProjectSummaries(
    projectMap: Map<string | null, {
      projectId: string | null;
      projectName: string;
      totalHours: number;
      tasks: Map<string | null, {
        taskId: string | null;
        taskName: string;
        totalHours: number;
      }>;
    }>
  ): ProjectTimeSummary[] {
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


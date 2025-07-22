import { TimeTracking } from './entities/time-tracking.entity';

export interface AnalyticsParams {
    userId: string;
    projectId?: string;
    startDate?: string;
    endDate?: string;
  }

export interface TaskTimeSummary {
  taskId: string | null;
  taskName: string;
  totalHours: number;
  entries: TimeTracking[];
}

export interface ProjectTimeSummary {
  projectId: string | null;
  projectName: string;
  totalHours: number;
  tasks: Array<{
    taskId: string | null;
    taskName: string;
    totalHours: number;
  }>;
}

export interface ProductivityMetrics {
  onTimeCompletionRate: number;
  overdueTasks: number;
  timeEstimateAccuracy: number;
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  dailyTrends: Array<{
    date: string;
    completed: number;
    created: number;
  }>;
}

export interface DailyTrend {
  date: string;
  completed: number;
  created: number;
}

export interface BurndownChartData {
    date: string;
    ideal: number;
    actual: number;
    tasksRemaining: number;
  }
  
  export interface TeamMemberContribution {
    userId: string;
    userName: string;
    avatarUrl?: string;
    hoursLogged: number;
    tasksCompleted: number;
    contributionPercentage: number;
  }
  
  export interface TeamPerformanceMetrics {
    teamVelocity: number;
    burndown: BurndownChartData[];
    individualContributions: TeamMemberContribution[];
    completionRates: {
      total: number;
      completed: number;
      percentage: number;
    };
  }
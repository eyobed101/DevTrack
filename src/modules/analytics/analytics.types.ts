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
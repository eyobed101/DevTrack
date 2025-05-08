export enum ReportType {
    TASK_COMPLETION = 'task_completion',
    TIME_TRACKING = 'time_tracking',
    TEAM_PERFORMANCE = 'team_performance',
    PROJECT_PROGRESS = 'project_progress',
    BURNDOWN = 'burndown',
    VELOCITY = 'velocity'
  }
  
  export enum ExportFormat {
    PDF = 'PDF',
    CSV = 'CSV',
    EXCEL = 'EXCEL',
    JSON = 'JSON'
  }
  
  export enum ReportStatus {
    PENDING = 'pending',
    GENERATED = 'generated',
    FAILED = 'failed'
  }
// src/modules/tasks/task.enum.ts
export enum TaskStatus {
    BACKLOG = 'backlog',
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    IN_REVIEW = 'in_review',
    DONE = 'done',
    BLOCKED = 'blocked',
    NOT_STARTED = 'NOT_STARTED',
    COMPLETED = 'COMPLETED'
  }
  
  export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
    URGENT = 'urgent'
  }
  
  export enum TaskLabelColor {
    RED = '#ff0000',
    BLUE = '#0000ff',
    GREEN = '#00ff00',
    YELLOW = '#ffff00',
    ORANGE = '#ffa500',
    PURPLE = '#800080',
    PINK = '#ffc0cb',
    GRAY = '#808080'
  }

  // src/modules/tasks/task.enum.ts

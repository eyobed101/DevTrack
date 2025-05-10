export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_DUE = 'task_due',
  TASK_COMMENT = 'task_comment',
  PROJECT_INVITE = 'project_invite',
  TEAM_INVITE = 'team_invite',
  SYSTEM_ALERT = 'system_alert',
  MENTION = 'mention'
}

export enum RelatedEntityType {
  TASK = 'task',
  PROJECT = 'project',
  TEAM = 'team',
  COMMENT = 'comment'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived'
}
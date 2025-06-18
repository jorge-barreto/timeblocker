export enum TaskStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum RecurrenceType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export interface NotificationSettings {
  enabled: boolean;
  minutesBefore?: number;
}

export interface RecurrenceSettings {
  type: RecurrenceType;
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[];
  dayOfMonth?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  timezone: string;
  dailyPlanningTime?: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  deadline?: Date;
  estimatedMinutes?: number;
  recurrence?: RecurrenceSettings;
  parentTask?: Task;
  subtasks?: Task[];
  totalMinutesWorked: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeBlock {
  id: string;
  title: string;
  start: Date;
  end: Date;
  actualEnd?: Date;
  category?: string;
  notes?: string;
  notification?: NotificationSettings;
  task?: Task;
  createdAt: Date;
  updatedAt: Date;
}
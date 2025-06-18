# TimeBlocker Backend

## Directory Structure
```
backend/
├── src/
│   ├── entities/
│   │   ├── User.ts
│   │   ├── Task.ts
│   │   └── TimeBlock.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── task.controller.ts
│   │   └── timeblock.controller.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── notification.service.ts
│   │   └── sync.service.ts
│   ├── config/
│   │   └── mikro-orm.config.ts
│   ├── types/
│   │   └── index.ts
│   └── app.ts
├── migrations/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

## package.json
```json
{
  "name": "timeblocker-backend",
  "version": "1.0.0",
  "description": "TimeBlocker task management backend",
  "main": "dist/app.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "migration:create": "mikro-orm migration:create",
    "migration:up": "mikro-orm migration:up",
    "migration:down": "mikro-orm migration:down"
  },
  "dependencies": {
    "@mikro-orm/core": "^5.9.0",
    "@mikro-orm/postgresql": "^5.9.0",
    "@mikro-orm/migrations": "^5.9.0",
    "@mikro-orm/cli": "^5.9.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-validator": "^7.0.1",
    "date-fns": "^2.30.0",
    "date-fns-tz": "^2.0.0",
    "web-push": "^3.6.6",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/web-push": "^3.6.3",
    "typescript": "^5.3.3",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2"
  }
}
```

## tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## .env.example
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/timeblocker
JWT_SECRET=your-secret-key-here
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=mailto:your-email@example.com
```

## docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: timeblocker
      POSTGRES_PASSWORD: timeblocker_password
      POSTGRES_DB: timeblocker
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://timeblocker:timeblocker_password@postgres:5432/timeblocker
      NODE_ENV: production
    depends_on:
      - postgres
    volumes:
      - ./src:/app/src
      - ./migrations:/app/migrations

volumes:
  postgres_data:
```

## Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## src/config/mikro-orm.config.ts
```typescript
import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { User } from '../entities/User';
import { Task } from '../entities/Task';
import { TimeBlock } from '../entities/TimeBlock';
import path from 'path';

const config: Options<PostgreSqlDriver> = {
  entities: [User, Task, TimeBlock],
  dbName: process.env.DATABASE_URL,
  type: 'postgresql',
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    path: path.join(__dirname, '../../migrations'),
    pathTs: path.join(__dirname, '../../migrations'),
    glob: '!(*.d).{js,ts}',
  },
};

export default config;
```

## src/types/index.ts
```typescript
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
  minutesBefore?: number; // 0 means at start time
}

export interface RecurrenceSettings {
  type: RecurrenceType;
  interval: number; // e.g., every 2 weeks
  endDate?: Date;
  daysOfWeek?: number[]; // 0-6 for weekly recurrence
  dayOfMonth?: number; // for monthly recurrence
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
```

## src/entities/User.ts
```typescript
import { Entity, PrimaryKey, Property, Collection, OneToMany, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Task } from './Task';
import { TimeBlock } from './TimeBlock';
import { PushSubscription } from '../types';

@Entity()
export class User {
  @PrimaryKey()
  id: string = v4();

  @Property()
  @Unique()
  email!: string;

  @Property()
  passwordHash!: string;

  @Property({ nullable: true })
  name?: string;

  @Property({ type: 'json', nullable: true })
  pushSubscriptions: PushSubscription[] = [];

  @Property({ nullable: true })
  dailyPlanningTime?: string; // HH:mm format

  @Property()
  timezone: string = 'UTC';

  @OneToMany(() => Task, task => task.user)
  tasks = new Collection<Task>(this);

  @OneToMany(() => TimeBlock, timeBlock => timeBlock.user)
  timeBlocks = new Collection<TimeBlock>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
```

## src/entities/Task.ts
```typescript
import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Enum } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './User';
import { TimeBlock } from './TimeBlock';
import { TaskStatus, TaskPriority, RecurrenceSettings } from '../types';

@Entity()
export class Task {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  title!: string;

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Enum(() => TaskStatus)
  status: TaskStatus = TaskStatus.PENDING;

  @Enum(() => TaskPriority)
  priority: TaskPriority = TaskPriority.MEDIUM;

  @Property({ nullable: true })
  category?: string;

  @Property({ nullable: true })
  deadline?: Date;

  @Property({ nullable: true })
  estimatedMinutes?: number;

  @Property({ type: 'json', nullable: true })
  recurrence?: RecurrenceSettings;

  @ManyToOne(() => Task, { nullable: true })
  parentTask?: Task;

  @OneToMany(() => Task, task => task.parentTask)
  subtasks = new Collection<Task>(this);

  @OneToMany(() => TimeBlock, timeBlock => timeBlock.task)
  timeBlocks = new Collection<TimeBlock>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ persist: false })
  get totalMinutesWorked(): number {
    return this.timeBlocks
      .getItems()
      .reduce((total, block) => {
        const duration = (block.actualEnd || block.end).getTime() - block.start.getTime();
        return total + Math.floor(duration / 60000);
      }, 0);
  }
}
```

## src/entities/TimeBlock.ts
```typescript
import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './User';
import { Task } from './Task';
import { NotificationSettings } from '../types';

@Entity()
@Index({ properties: ['user', 'start', 'end'] })
export class TimeBlock {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Task, { nullable: true })
  task?: Task;

  @Property()
  start!: Date;

  @Property()
  end!: Date;

  @Property({ nullable: true })
  actualEnd?: Date;

  @Property()
  title!: string;

  @Property({ nullable: true })
  category?: string;

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Property({ type: 'json', nullable: true })
  notification?: NotificationSettings;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
```

## src/middleware/auth.middleware.ts
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};
```

## src/services/auth.service.ts
```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { JWTPayload } from '../types';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '7d'
    });
  }

  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  }
}
```

## src/services/notification.service.ts
```typescript
import webpush from 'web-push';
import { User } from '../entities/User';
import { TimeBlock } from '../entities/TimeBlock';
import { EntityManager } from '@mikro-orm/core';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export class NotificationService {
  static initialize() {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL!,
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
  }

  static async sendNotification(user: User, title: string, body: string, data?: any) {
    const notifications = user.pushSubscriptions.map(subscription =>
      webpush.sendNotification(
        subscription,
        JSON.stringify({
          title,
          body,
          data,
          timestamp: Date.now()
        })
      ).catch(err => {
        console.error('Error sending notification:', err);
        // Remove invalid subscriptions
        if (err.statusCode === 410) {
          user.pushSubscriptions = user.pushSubscriptions.filter(
            sub => sub.endpoint !== subscription.endpoint
          );
        }
      })
    );

    await Promise.all(notifications);
  }

  static async scheduleTimeBlockNotification(em: EntityManager, timeBlock: TimeBlock) {
    if (!timeBlock.notification?.enabled) return;

    const user = await em.findOne(User, { id: timeBlock.user.id });
    if (!user) return;

    const minutesBefore = timeBlock.notification.minutesBefore || 0;
    const notificationTime = new Date(timeBlock.start.getTime() - minutesBefore * 60000);
    
    // Convert to user's timezone for display
    const userTime = utcToZonedTime(timeBlock.start, user.timezone);
    const formattedTime = format(userTime, 'h:mm a');

    const title = minutesBefore > 0
      ? `Upcoming: ${timeBlock.title}`
      : `Starting now: ${timeBlock.title}`;
    
    const body = `Scheduled for ${formattedTime}`;

    // In production, use a job queue like Bull or Agenda
    const delay = notificationTime.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        this.sendNotification(user, title, body, { timeBlockId: timeBlock.id });
      }, delay);
    }
  }

  static async sendDailyPlanningReminder(em: EntityManager) {
    const users = await em.find(User, { 
      dailyPlanningTime: { $ne: null } 
    });

    for (const user of users) {
      const title = 'Time to plan your day!';
      const body = 'Review your tasks and schedule your time blocks for today.';
      
      await this.sendNotification(user, title, body, { 
        type: 'daily-planning',
        url: '/day'
      });
    }
  }
}
```

## src/controllers/auth.controller.ts
```typescript
import { Request, Response } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/User';
import { AuthService } from '../services/auth.service';
import { body, validationResult } from 'express-validator';

export class AuthController {
  constructor(private em: EntityManager) {}

  register = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').optional().trim(),
    body('timezone').optional().isString(),
    
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, name, timezone } = req.body;

        const existingUser = await this.em.findOne(User, { email });
        if (existingUser) {
          return res.status(400).json({ error: 'Email already registered' });
        }

        const user = this.em.create(User, {
          email,
          passwordHash: await AuthService.hashPassword(password),
          name,
          timezone: timezone || 'UTC'
        });

        await this.em.persistAndFlush(user);

        const token = AuthService.generateToken(user);
        
        res.status(201).json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            timezone: user.timezone
          },
          token
        });
      } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
      }
    }
  ];

  login = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await this.em.findOne(User, { email });
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await AuthService.comparePasswords(password, user.passwordHash);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = AuthService.generateToken(user);
        
        res.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            timezone: user.timezone
          },
          token
        });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
      }
    }
  ];

  updatePushSubscription = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { subscription } = req.body;

      const user = await this.em.findOne(User, { id: userId });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Add or update subscription
      const existingIndex = user.pushSubscriptions.findIndex(
        sub => sub.endpoint === subscription.endpoint
      );

      if (existingIndex >= 0) {
        user.pushSubscriptions[existingIndex] = subscription;
      } else {
        user.pushSubscriptions.push(subscription);
      }

      await this.em.persistAndFlush(user);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Push subscription error:', error);
      res.status(500).json({ error: 'Failed to update push subscription' });
    }
  };
}
```

## src/controllers/task.controller.ts
```typescript
import { Request, Response } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { TaskStatus, TaskPriority } from '../types';
import { body, validationResult } from 'express-validator';

export class TaskController {
  constructor(private em: EntityManager) {}

  getTasks = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { status, priority, parentId } = req.query;

      const where: any = { user: userId };
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (parentId !== undefined) {
        where.parentTask = parentId || null;
      }

      const tasks = await this.em.find(Task, where, {
        populate: ['subtasks', 'timeBlocks'],
        orderBy: { priority: 'DESC', createdAt: 'DESC' }
      });

      res.json(tasks);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  };

  createTask = [
    body('title').notEmpty().trim(),
    body('priority').optional().isIn(Object.values(TaskPriority)),
    body('parentTaskId').optional().isUUID(),
    body('estimatedMinutes').optional().isInt({ min: 0 }),
    body('deadline').optional().isISO8601(),
    
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user!.userId;
        const user = await this.em.findOne(User, { id: userId });
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        const taskData: any = {
          user,
          title: req.body.title,
          notes: req.body.notes,
          priority: req.body.priority || TaskPriority.MEDIUM,
          category: req.body.category,
          estimatedMinutes: req.body.estimatedMinutes,
          deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
          recurrence: req.body.recurrence
        };

        if (req.body.parentTaskId) {
          const parentTask = await this.em.findOne(Task, { 
            id: req.body.parentTaskId,
            user: userId 
          });
          if (!parentTask) {
            return res.status(404).json({ error: 'Parent task not found' });
          }
          taskData.parentTask = parentTask;
        }

        const task = this.em.create(Task, taskData);
        await this.em.persistAndFlush(task);

        res.status(201).json(task);
      } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
      }
    }
  ];

  updateTask = [
    body('title').optional().trim(),
    body('status').optional().isIn(Object.values(TaskStatus)),
    body('priority').optional().isIn(Object.values(TaskPriority)),
    
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user!.userId;
        const taskId = req.params.id;

        const task = await this.em.findOne(Task, { 
          id: taskId,
          user: userId 
        });

        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        // Update fields
        Object.assign(task, req.body);
        
        await this.em.persistAndFlush(task);

        res.json(task);
      } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Failed to update task' });
      }
    }
  ];

  deleteTask = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id;

      const task = await this.em.findOne(Task, { 
        id: taskId,
        user: userId 
      }, {
        populate: ['subtasks']
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Recursively delete subtasks
      await this.em.removeAndFlush(task);

      res.json({ success: true });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  };
}
```

## src/controllers/timeblock.controller.ts
```typescript
import { Request, Response } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { TimeBlock } from '../entities/TimeBlock';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { NotificationService } from '../services/notification.service';
import { body, validationResult } from 'express-validator';
import { startOfDay, endOfDay } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

export class TimeBlockController {
  constructor(private em: EntityManager) {}

  getDayView = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { date } = req.query;

      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: 'Date parameter required' });
      }

      const user = await this.em.findOne(User, { id: userId });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Convert user's local date to UTC range
      const userDate = new Date(date);
      const dayStart = zonedTimeToUtc(startOfDay(userDate), user.timezone);
      const dayEnd = zonedTimeToUtc(endOfDay(userDate), user.timezone);

      const timeBlocks = await this.em.find(TimeBlock, {
        user: userId,
        $or: [
          { start: { $gte: dayStart, $lt: dayEnd } },
          { end: { $gt: dayStart, $lte: dayEnd } },
          { 
            start: { $lt: dayStart },
            end: { $gt: dayEnd }
          }
        ]
      }, {
        populate: ['task'],
        orderBy: { start: 'ASC' }
      });

      res.json(timeBlocks);
    } catch (error) {
      console.error('Get day view error:', error);
      res.status(500).json({ error: 'Failed to fetch day view' });
    }
  };

  createTimeBlock = [
    body('title').notEmpty().trim(),
    body('start').isISO8601(),
    body('end').isISO8601(),
    body('taskId').optional().isUUID(),
    
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user!.userId;
        const { title, start, end, taskId, category, notes, notification } = req.body;

        const user = await this.em.findOne(User, { id: userId });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        // Validate 15-minute increments
        if (startDate.getMinutes() % 15 !== 0 || endDate.getMinutes() % 15 !== 0) {
          return res.status(400).json({ error: 'Time must be in 15-minute increments' });
        }

        // Check for overlaps
        const overlaps = await this.checkOverlap(userId, startDate, endDate);
        if (overlaps) {
          return res.status(400).json({ error: 'Time block overlaps with existing block' });
        }

        const timeBlockData: any = {
          user,
          title,
          start: startDate,
          end: endDate,
          category,
          notes,
          notification
        };

        if (taskId) {
          const task = await this.em.findOne(Task, { 
            id: taskId,
            user: userId 
          });
          if (!task) {
            return res.status(404).json({ error: 'Task not found' });
          }
          timeBlockData.task = task;
        }

        const timeBlock = this.em.create(TimeBlock, timeBlockData);
        await this.em.persistAndFlush(timeBlock);

        // Schedule notification if enabled
        if (notification?.enabled) {
          await NotificationService.scheduleTimeBlockNotification(this.em, timeBlock);
        }

        res.status(201).json(timeBlock);
      } catch (error) {
        console.error('Create time block error:', error);
        res.status(500).json({ error: 'Failed to create time block' });
      }
    }
  ];

  updateTimeBlock = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const blockId = req.params.id;
      const updates = req.body;

      const timeBlock = await this.em.findOne(TimeBlock, { 
        id: blockId,
        user: userId 
      });

      if (!timeBlock) {
        return res.status(404).json({ error: 'Time block not found' });
      }

      // Handle early ending
      if (updates.actualEnd) {
        timeBlock.actualEnd = new Date(updates.actualEnd);
      }

      // Update other fields
      if (updates.start || updates.end) {
        const newStart = updates.start ? new Date(updates.start) : timeBlock.start;
        const newEnd = updates.end ? new Date(updates.end) : timeBlock.end;

        // Check for overlaps (excluding current block)
        const overlaps = await this.checkOverlap(userId, newStart, newEnd, blockId);
        if (overlaps) {
          return res.status(400).json({ error: 'Time block overlaps with existing block' });
        }

        timeBlock.start = newStart;
        timeBlock.end = newEnd;
      }

      // Update other properties
      ['title', 'category', 'notes', 'notification'].forEach(field => {
        if (updates[field] !== undefined) {
          (timeBlock as any)[field] = updates[field];
        }
      });

      await this.em.persistAndFlush(timeBlock);

      res.json(timeBlock);
    } catch (error) {
      console.error('Update time block error:', error);
      res.status(500).json({ error: 'Failed to update time block' });
    }
  };

  deleteTimeBlock = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const blockId = req.params.id;

      const timeBlock = await this.em.findOne(TimeBlock, { 
        id: blockId,
        user: userId 
      });

      if (!timeBlock) {
        return res.status(404).json({ error: 'Time block not found' });
      }

      await this.em.removeAndFlush(timeBlock);

      res.json({ success: true });
    } catch (error) {
      console.error('Delete time block error:', error);
      res.status(500).json({ error: 'Failed to delete time block' });
    }
  };

  private async checkOverlap(
    userId: string, 
    start: Date, 
    end: Date, 
    excludeId?: string
  ): Promise<boolean> {
    const query: any = {
      user: userId,
      $or: [
        {
          start: { $lt: end },
          end: { $gt: start }
        }
      ]
    };

    if (excludeId) {
      query.id = { $ne: excludeId };
    }

    const overlapping = await this.em.count(TimeBlock, query);
    return overlapping > 0;
  }
}
```

## src/app.ts
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import mikroOrmConfig from './config/mikro-orm.config';
import { AuthController } from './controllers/auth.controller';
import { TaskController } from './controllers/task.controller';
import { TimeBlockController } from './controllers/timeblock.controller';
import { authenticate } from './middleware/auth.middleware';
import { NotificationService } from './services/notification.service';
import cron from 'node-cron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

async function initializeApp() {
  try {
    // Initialize MikroORM
    const orm = await MikroORM.init<PostgreSqlDriver>(mikroOrmConfig);
    
    // Run migrations
    const migrator = orm.getMigrator();
    await migrator.up();

    // Initialize services
    NotificationService.initialize();

    // Request context middleware
    app.use((req, res, next) => {
      RequestContext.create(orm.em, next);
    });

    // Controllers
    const authController = new AuthController(orm.em);
    const taskController = new TaskController(orm.em);
    const timeBlockController = new TimeBlockController(orm.em);

    // Routes
    // Auth routes
    app.post('/api/auth/register', authController.register);
    app.post('/api/auth/login', authController.login);
    app.post('/api/auth/push-subscription', authenticate, authController.updatePushSubscription);

    // Task routes
    app.get('/api/tasks', authenticate, taskController.getTasks);
    app.post('/api/tasks', authenticate, taskController.createTask);
    app.patch('/api/tasks/:id', authenticate, taskController.updateTask);
    app.delete('/api/tasks/:id', authenticate, taskController.deleteTask);

    // TimeBlock routes
    app.get('/api/day-view', authenticate, timeBlockController.getDayView);
    app.post('/api/timeblocks', authenticate, timeBlockController.createTimeBlock);
    app.patch('/api/timeblocks/:id', authenticate, timeBlockController.updateTimeBlock);
    app.delete('/api/timeblocks/:id', authenticate, timeBlockController.deleteTimeBlock);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Schedule daily planning reminders (every day at 9 AM)
    cron.schedule('0 9 * * *', async () => {
      const em = orm.em.fork();
      await NotificationService.sendDailyPlanningReminder(em);
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
}

initializeApp();
```

## Initial Migration (example)
Create this file as `migrations/Migration20240101000000.ts`:

```typescript
import { Migration } from '@mikro-orm/migrations';

export class Migration20240101000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE "user" (
        "id" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "name" varchar(255) NULL,
        "push_subscriptions" jsonb DEFAULT '[]',
        "daily_planning_time" varchar(255) NULL,
        "timezone" varchar(255) NOT NULL DEFAULT 'UTC',
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        CONSTRAINT "user_pkey" PRIMARY KEY ("id")
      );
    `);
    
    this.addSql('CREATE UNIQUE INDEX "user_email_unique" ON "user" ("email");');

    this.addSql(`
      CREATE TABLE "task" (
        "id" varchar(255) NOT NULL,
        "user_id" varchar(255) NOT NULL,
        "title" varchar(255) NOT NULL,
        "notes" text NULL,
        "status" varchar(255) NOT NULL DEFAULT 'PENDING',
        "priority" varchar(255) NOT NULL DEFAULT 'MEDIUM',
        "category" varchar(255) NULL,
        "deadline" timestamptz NULL,
        "estimated_minutes" int NULL,
        "recurrence" jsonb NULL,
        "parent_task_id" varchar(255) NULL,
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        CONSTRAINT "task_pkey" PRIMARY KEY ("id")
      );
    `);

    this.addSql('ALTER TABLE "task" ADD CONSTRAINT "task_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON UPDATE CASCADE;');
    this.addSql('ALTER TABLE "task" ADD CONSTRAINT "task_parent_task_id_foreign" FOREIGN KEY ("parent_task_id") REFERENCES "task" ("id") ON UPDATE CASCADE ON DELETE SET NULL;');

    this.addSql(`
      CREATE TABLE "time_block" (
        "id" varchar(255) NOT NULL,
        "user_id" varchar(255) NOT NULL,
        "task_id" varchar(255) NULL,
        "start" timestamptz NOT NULL,
        "end" timestamptz NOT NULL,
        "actual_end" timestamptz NULL,
        "title" varchar(255) NOT NULL,
        "category" varchar(255) NULL,
        "notes" text NULL,
        "notification" jsonb NULL,
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        CONSTRAINT "time_block_pkey" PRIMARY KEY ("id")
      );
    `);

    this.addSql('ALTER TABLE "time_block" ADD CONSTRAINT "time_block_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON UPDATE CASCADE;');
    this.addSql('ALTER TABLE "time_block" ADD CONSTRAINT "time_block_task_id_foreign" FOREIGN KEY ("task_id") REFERENCES "task" ("id") ON UPDATE CASCADE ON DELETE SET NULL;');
    this.addSql('CREATE INDEX "time_block_user_id_start_end_index" ON "time_block" ("user_id", "start", "end");');
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "time_block" CASCADE;');
    this.addSql('DROP TABLE IF EXISTS "task" CASCADE;');
    this.addSql('DROP TABLE IF EXISTS "user" CASCADE;');
  }
}
```
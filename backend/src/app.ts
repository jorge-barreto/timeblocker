import express from 'express';
import cors from 'cors';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import mikroOrmConfig from './config/mikro-orm.config';
import { config } from './config/env.config';
import { AuthController } from './controllers/auth.controller';
import { TaskController } from './controllers/task.controller';
import { TimeBlockController } from './controllers/timeblock.controller';
import { authenticate } from './middleware/auth.middleware';
import { NotificationService } from './services/notification.service';
import cron from 'node-cron';

const app = express();
const PORT = config.PORT;

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
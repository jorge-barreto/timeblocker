import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../src/entities/User';
import { Task } from '../src/entities/Task';
import { TimeBlock } from '../src/entities/TimeBlock';
import { AuthService } from '../src/services/auth.service';
import { TaskStatus, TaskPriority } from '../src/types';
import dayjs from 'dayjs';

export class DemoSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Check if demo user already exists
    const demoEmail = 'demo@timeblocker.app';
    let demoUser = await em.findOne(User, { email: demoEmail });
    
    if (demoUser) {
      console.log('Demo user already exists, clearing existing data...');
      // Remove existing demo tasks and time blocks
      await em.nativeDelete(Task, { user: demoUser.id });
      await em.nativeDelete(TimeBlock, { user: demoUser.id });
    } else {
      console.log('Creating demo user...');
      // Create demo user
      demoUser = em.create(User, {
        email: demoEmail,
        passwordHash: await AuthService.hashPassword('demo123'),
        name: 'Demo User',
        timezone: 'America/New_York',
        dailyPlanningTime: '09:00',
      });
      await em.persistAndFlush(demoUser);
    }

    await this.createDemoData(em, demoUser);
    console.log('Demo data seeded successfully!');
  }

  private async createDemoData(em: EntityManager, user: User): Promise<void> {
    const today = dayjs().startOf('day').toDate();
    const tomorrow = dayjs().add(1, 'day').startOf('day').toDate();
    const nextWeek = dayjs().add(7, 'day').startOf('day').toDate();

    console.log('Creating demo tasks...');

    // Create main project task with subtasks
    const workProject = em.create(Task, {
      user,
      title: 'Q4 Product Launch',
      notes: 'Complete product launch preparation for Q4 release',
      priority: TaskPriority.HIGH,
      category: 'Work',
      deadline: dayjs(today).add(14, 'day').toDate(),
      estimatedMinutes: 480,
      status: TaskStatus.IN_PROGRESS,
    });

    await em.persistAndFlush(workProject);

    // Subtasks for the main project
    const marketingPlan = em.create(Task, {
      user,
      title: 'Create marketing campaign',
      notes: 'Design social media and email marketing strategy',
      priority: TaskPriority.HIGH,
      category: 'Work',
      parentTask: workProject,
      estimatedMinutes: 120,
      status: TaskStatus.PENDING,
    });

    const testingPlan = em.create(Task, {
      user,
      title: 'Final testing & QA',
      notes: 'Complete end-to-end testing before launch',
      priority: TaskPriority.HIGH,
      category: 'Work',
      parentTask: workProject,
      estimatedMinutes: 180,
      status: TaskStatus.SCHEDULED,
    });

    const documentation = em.create(Task, {
      user,
      title: 'Update user documentation',
      notes: 'Revise help docs and tutorial videos',
      priority: TaskPriority.MEDIUM,
      category: 'Work',
      parentTask: workProject,
      estimatedMinutes: 90,
      status: TaskStatus.COMPLETED,
    });

    // Standalone tasks
    const meetingPrep = em.create(Task, {
      user,
      title: 'Team standup preparation',
      notes: 'Review yesterday\'s progress and plan today\'s work',
      priority: TaskPriority.MEDIUM,
      category: 'Work',
      estimatedMinutes: 15,
      status: TaskStatus.COMPLETED,
    });

    const clientCall = em.create(Task, {
      user,
      title: 'Client feedback session',
      notes: 'Review prototype with key stakeholders',
      priority: TaskPriority.HIGH,
      category: 'Work',
      deadline: dayjs(today).add(2, 'day').toDate(),
      estimatedMinutes: 60,
      status: TaskStatus.SCHEDULED,
    });

    const personalTask = em.create(Task, {
      user,
      title: 'Plan vacation',
      notes: 'Research destinations and book accommodations for summer trip',
      priority: TaskPriority.LOW,
      category: 'Personal',
      deadline: nextWeek,
      estimatedMinutes: 90,
      status: TaskStatus.PENDING,
    });

    const workoutTask = em.create(Task, {
      user,
      title: 'Morning workout routine',
      notes: 'Gym session: 30min cardio + 30min strength training',
      priority: TaskPriority.MEDIUM,
      category: 'Health',
      estimatedMinutes: 60,
      status: TaskStatus.SCHEDULED,
    });

    const learningTask = em.create(Task, {
      user,
      title: 'TypeScript advanced features',
      notes: 'Study decorators, generics, and utility types',
      priority: TaskPriority.MEDIUM,
      category: 'Learning',
      estimatedMinutes: 120,
      status: TaskStatus.PENDING,
    });

    const emailTask = em.create(Task, {
      user,
      title: 'Clear inbox',
      notes: 'Process and respond to pending emails',
      priority: TaskPriority.LOW,
      category: 'Admin',
      estimatedMinutes: 30,
      status: TaskStatus.PENDING,
    });

    await em.persistAndFlush([
      marketingPlan, testingPlan, documentation, meetingPrep,
      clientCall, personalTask, workoutTask, learningTask, emailTask
    ]);

    console.log('Creating demo time blocks...');

    // Create demo time blocks for today
    const morningWorkout = em.create(TimeBlock, {
      user,
      task: workoutTask,
      title: 'Morning workout routine',
      start: dayjs(today).add(7, 'hour').toDate(),
      end: dayjs(today).add(8, 'hour').toDate(),
      category: 'Health',
      notes: 'Cardio + strength training',
      notification: { enabled: true, minutesBefore: 10 },
    });

    const standupMeeting = em.create(TimeBlock, {
      user,
      task: meetingPrep,
      title: 'Team Standup',
      start: dayjs(today).add(9, 'hour').toDate(),
      end: dayjs(today).add(9, 'hour').add(30, 'minute').toDate(),
      category: 'Work',
      notification: { enabled: true, minutesBefore: 5 },
      actualEnd: dayjs(today).add(9, 'hour').add(25, 'minute').toDate(), // Completed early
    });

    const emailTime = em.create(TimeBlock, {
      user,
      task: emailTask,
      title: 'Process emails',
      start: dayjs(today).add(9, 'hour').add(30, 'minute').toDate(),
      end: dayjs(today).add(10, 'hour').toDate(),
      category: 'Admin',
    });

    const focusWork = em.create(TimeBlock, {
      user,
      task: marketingPlan,
      title: 'Marketing campaign planning',
      start: dayjs(today).add(10, 'hour').toDate(),
      end: dayjs(today).add(12, 'hour').toDate(),
      category: 'Work',
      notes: 'Deep work - no interruptions',
    });

    const lunchBreak = em.create(TimeBlock, {
      user,
      title: 'Lunch break',
      start: dayjs(today).add(12, 'hour').toDate(),
      end: dayjs(today).add(13, 'hour').toDate(),
      category: 'Break',
    });

    const clientCallBlock = em.create(TimeBlock, {
      user,
      task: clientCall,
      title: 'Client feedback session',
      start: dayjs(today).add(14, 'hour').toDate(),
      end: dayjs(today).add(15, 'hour').toDate(),
      category: 'Work',
      notification: { enabled: true, minutesBefore: 15 },
    });

    const testingWork = em.create(TimeBlock, {
      user,
      task: testingPlan,
      title: 'QA Testing Session',
      start: dayjs(today).add(15, 'hour').add(15, 'minute').toDate(),
      end: dayjs(today).add(16, 'hour').add(45, 'minute').toDate(),
      category: 'Work',
    });

    const learningBlock = em.create(TimeBlock, {
      user,
      task: learningTask,
      title: 'TypeScript Learning',
      start: dayjs(today).add(17, 'hour').toDate(),
      end: dayjs(today).add(18, 'hour').add(30, 'minute').toDate(),
      category: 'Learning',
    });

    // Tomorrow's time blocks
    const tomorrowWorkout = em.create(TimeBlock, {
      user,
      title: 'Morning run',
      start: dayjs(tomorrow).add(6, 'hour').add(30, 'minute').toDate(),
      end: dayjs(tomorrow).add(7, 'hour').add(30, 'minute').toDate(),
      category: 'Health',
    });

    const planningTime = em.create(TimeBlock, {
      user,
      title: 'Daily planning & review',
      start: dayjs(tomorrow).add(9, 'hour').toDate(),
      end: dayjs(tomorrow).add(9, 'hour').add(30, 'minute').toDate(),
      category: 'Planning',
      notification: { enabled: true, minutesBefore: 0 },
    });

    const vacationPlanning = em.create(TimeBlock, {
      user,
      task: personalTask,
      title: 'Vacation research',
      start: dayjs(tomorrow).add(10, 'hour').toDate(),
      end: dayjs(tomorrow).add(11, 'hour').add(30, 'minute').toDate(),
      category: 'Personal',
    });

    const projectReview = em.create(TimeBlock, {
      user,
      task: workProject,
      title: 'Q4 Launch Progress Review',
      start: dayjs(tomorrow).add(14, 'hour').toDate(),
      end: dayjs(tomorrow).add(16, 'hour').toDate(),
      category: 'Work',
    });

    await em.persistAndFlush([
      morningWorkout,
      standupMeeting,
      emailTime,
      focusWork,
      lunchBreak,
      clientCallBlock,
      testingWork,
      learningBlock,
      tomorrowWorkout,
      planningTime,
      vacationPlanning,
      projectReview
    ]);

    console.log('Demo time blocks created successfully!');
  }
}
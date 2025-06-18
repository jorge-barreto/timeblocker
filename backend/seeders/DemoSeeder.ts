import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../src/entities/User';
import { Task } from '../src/entities/Task';
import { TimeBlock } from '../src/entities/TimeBlock';
import { AuthService } from '../src/services/auth.service';
import { TaskStatus, TaskPriority } from '../src/types';
import { addHours, addDays, startOfDay, addMinutes } from 'date-fns';

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
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    const nextWeek = addDays(today, 7);

    console.log('Creating demo tasks...');

    // Create main project task with subtasks
    const workProject = em.create(Task, {
      user,
      title: 'Q4 Product Launch',
      notes: 'Complete product launch preparation for Q4 release',
      priority: TaskPriority.HIGH,
      category: 'Work',
      deadline: addDays(today, 14),
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
      deadline: addDays(today, 2),
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
      start: addHours(today, 7),
      end: addHours(today, 8),
      category: 'Health',
      notes: 'Cardio + strength training',
      notification: { enabled: true, minutesBefore: 10 },
    });

    const standupMeeting = em.create(TimeBlock, {
      user,
      task: meetingPrep,
      title: 'Team Standup',
      start: addHours(today, 9),
      end: addMinutes(addHours(today, 9), 30),
      category: 'Work',
      notification: { enabled: true, minutesBefore: 5 },
      actualEnd: addMinutes(addHours(today, 9), 25), // Completed early
    });

    const emailTime = em.create(TimeBlock, {
      user,
      task: emailTask,
      title: 'Process emails',
      start: addMinutes(addHours(today, 9), 30),
      end: addHours(today, 10),
      category: 'Admin',
    });

    const focusWork = em.create(TimeBlock, {
      user,
      task: marketingPlan,
      title: 'Marketing campaign planning',
      start: addHours(today, 10),
      end: addHours(today, 12),
      category: 'Work',
      notes: 'Deep work - no interruptions',
    });

    const lunchBreak = em.create(TimeBlock, {
      user,
      title: 'Lunch break',
      start: addHours(today, 12),
      end: addHours(today, 13),
      category: 'Break',
    });

    const clientCallBlock = em.create(TimeBlock, {
      user,
      task: clientCall,
      title: 'Client feedback session',
      start: addHours(today, 14),
      end: addHours(today, 15),
      category: 'Work',
      notification: { enabled: true, minutesBefore: 15 },
    });

    const testingWork = em.create(TimeBlock, {
      user,
      task: testingPlan,
      title: 'QA Testing Session',
      start: addMinutes(addHours(today, 15), 15),
      end: addMinutes(addHours(today, 16), 45),
      category: 'Work',
    });

    const learningBlock = em.create(TimeBlock, {
      user,
      task: learningTask,
      title: 'TypeScript Learning',
      start: addHours(today, 17),
      end: addMinutes(addHours(today, 18), 30),
      category: 'Learning',
    });

    // Tomorrow's time blocks
    const tomorrowWorkout = em.create(TimeBlock, {
      user,
      title: 'Morning run',
      start: addMinutes(addHours(tomorrow, 6), 30),
      end: addMinutes(addHours(tomorrow, 7), 30),
      category: 'Health',
    });

    const planningTime = em.create(TimeBlock, {
      user,
      title: 'Daily planning & review',
      start: addHours(tomorrow, 9),
      end: addMinutes(addHours(tomorrow, 9), 30),
      category: 'Planning',
      notification: { enabled: true, minutesBefore: 0 },
    });

    const vacationPlanning = em.create(TimeBlock, {
      user,
      task: personalTask,
      title: 'Vacation research',
      start: addHours(tomorrow, 10),
      end: addMinutes(addHours(tomorrow, 11), 30),
      category: 'Personal',
    });

    const projectReview = em.create(TimeBlock, {
      user,
      task: workProject,
      title: 'Q4 Launch Progress Review',
      start: addHours(tomorrow, 14),
      end: addHours(tomorrow, 16),
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
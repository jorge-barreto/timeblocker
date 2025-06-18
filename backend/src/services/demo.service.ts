import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/User';
import { Task } from '../entities/Task';
import { TimeBlock } from '../entities/TimeBlock';
import { AuthService } from './auth.service';
import { TaskStatus, TaskPriority } from '../types';
import { addHours, addDays, startOfDay, addMinutes } from 'date-fns';

export class DemoService {
  static async createDemoUser(em: EntityManager): Promise<User> {
    const demoEmail = 'demo@timeblocker.app';
    
    // Check if demo user already exists
    let demoUser = await em.findOne(User, { email: demoEmail });
    
    if (demoUser) {
      return demoUser;
    }

    // Create demo user
    demoUser = new User();
    demoUser.email = demoEmail;
    demoUser.passwordHash = await AuthService.hashPassword('demo123');
    demoUser.name = 'Demo User';
    demoUser.timezone = 'America/New_York';
    demoUser.dailyPlanningTime = '09:00';

    await em.persistAndFlush(demoUser);

    // Create demo tasks and time blocks
    await this.createDemoData(em, demoUser);

    return demoUser;
  }

  private static async createDemoData(em: EntityManager, user: User): Promise<void> {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);

    // Create demo tasks
    const workProject = new Task();
    workProject.user = user;
    workProject.title = 'Q4 Project Planning';
    workProject.notes = 'Strategic planning for next quarter initiatives';
    workProject.priority = TaskPriority.HIGH;
    workProject.category = 'Work';
    workProject.deadline = addDays(today, 7);
    workProject.estimatedMinutes = 240;
    workProject.status = TaskStatus.SCHEDULED;

    const meetingPrep = new Task();
    meetingPrep.user = user;
    meetingPrep.title = 'Prepare for team standup';
    meetingPrep.notes = 'Review yesterday\'s progress and plan today\'s work';
    meetingPrep.priority = TaskPriority.MEDIUM;
    meetingPrep.category = 'Work';
    meetingPrep.estimatedMinutes = 15;
    meetingPrep.status = TaskStatus.COMPLETED;

    const personalTask = new Task();
    personalTask.user = user;
    personalTask.title = 'Plan weekend trip';
    personalTask.notes = 'Research destinations and book accommodations';
    personalTask.priority = TaskPriority.LOW;
    personalTask.category = 'Personal';
    personalTask.estimatedMinutes = 60;
    personalTask.status = TaskStatus.PENDING;

    const workoutTask = new Task();
    workoutTask.user = user;
    workoutTask.title = 'Morning workout';
    workoutTask.notes = 'Gym session: cardio + strength training';
    workoutTask.priority = TaskPriority.MEDIUM;
    workoutTask.category = 'Health';
    workoutTask.estimatedMinutes = 60;
    workoutTask.status = TaskStatus.SCHEDULED;

    await em.persistAndFlush([workProject, meetingPrep, personalTask, workoutTask]);

    // Create demo time blocks for today
    const morningWorkout = new TimeBlock();
    morningWorkout.user = user;
    morningWorkout.task = workoutTask;
    morningWorkout.title = 'Morning workout';
    morningWorkout.start = addHours(today, 7);
    morningWorkout.end = addHours(today, 8);
    morningWorkout.category = 'Health';
    morningWorkout.notification = { enabled: true, minutesBefore: 10 };

    const standupMeeting = new TimeBlock();
    standupMeeting.user = user;
    standupMeeting.task = meetingPrep;
    standupMeeting.title = 'Team Standup';
    standupMeeting.start = addHours(today, 9);
    standupMeeting.end = addMinutes(addHours(today, 9), 30);
    standupMeeting.category = 'Work';
    standupMeeting.notification = { enabled: true, minutesBefore: 5 };

    const focusWork = new TimeBlock();
    focusWork.user = user;
    focusWork.task = workProject;
    focusWork.title = 'Deep work: Q4 Planning';
    focusWork.start = addHours(today, 10);
    focusWork.end = addHours(today, 12);
    focusWork.category = 'Work';
    focusWork.notes = 'No interruptions - focus time';

    const lunchBreak = new TimeBlock();
    lunchBreak.user = user;
    lunchBreak.title = 'Lunch break';
    lunchBreak.start = addHours(today, 12);
    lunchBreak.end = addHours(today, 13);
    lunchBreak.category = 'Break';

    const afternoonWork = new TimeBlock();
    afternoonWork.user = user;
    afternoonWork.task = workProject;
    afternoonWork.title = 'Q4 Planning - Review & Analysis';
    afternoonWork.start = addHours(today, 14);
    afternoonWork.end = addHours(today, 16);
    afternoonWork.category = 'Work';

    // Tomorrow's time blocks
    const tomorrowWorkout = new TimeBlock();
    tomorrowWorkout.user = user;
    tomorrowWorkout.title = 'Morning run';
    tomorrowWorkout.start = addHours(tomorrow, 6).getTime() < addHours(today, 6).getTime() ? addHours(tomorrow, 7) : addHours(tomorrow, 6);
    tomorrowWorkout.end = addHours(tomorrowWorkout.start, 1);
    tomorrowWorkout.category = 'Health';

    const planningTime = new TimeBlock();
    planningTime.user = user;
    planningTime.title = 'Daily planning';
    planningTime.start = addHours(tomorrow, 9);
    planningTime.end = addMinutes(addHours(tomorrow, 9), 15);
    planningTime.category = 'Planning';
    planningTime.notification = { enabled: true, minutesBefore: 0 };

    await em.persistAndFlush([
      morningWorkout,
      standupMeeting, 
      focusWork,
      lunchBreak,
      afternoonWork,
      tomorrowWorkout,
      planningTime
    ]);
  }

  static async getDemoUserCredentials(): Promise<{ email: string; password: string }> {
    return {
      email: 'demo@timeblocker.app',
      password: 'demo123'
    };
  }
}
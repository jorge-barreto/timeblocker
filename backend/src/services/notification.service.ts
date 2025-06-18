import webpush from 'web-push';
import { User } from '../entities/User';
import { TimeBlock } from '../entities/TimeBlock';
import { EntityManager } from '@mikro-orm/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
import { config } from '../config/env.config';

export class NotificationService {
  static initialize() {
    webpush.setVapidDetails(
      config.VAPID_EMAIL,
      config.VAPID_PUBLIC_KEY,
      config.VAPID_PRIVATE_KEY
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
    const userTime = dayjs(timeBlock.start).tz(user.timezone);
    const formattedTime = userTime.format('h:mm A');

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
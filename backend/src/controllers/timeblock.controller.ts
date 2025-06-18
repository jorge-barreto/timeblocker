import { Request, Response } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { TimeBlock } from '../entities/TimeBlock';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { NotificationService } from '../services/notification.service';
import { body, validationResult } from 'express-validator';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

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
      const userDate = dayjs(date);
      const dayStart = userDate.tz(user.timezone).startOf('day').utc().toDate();
      const dayEnd = userDate.tz(user.timezone).endOf('day').utc().toDate();

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
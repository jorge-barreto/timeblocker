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
    body('deadline').optional({ nullable: true }).isISO8601(),
    
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
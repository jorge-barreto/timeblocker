import { Request, Response } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/User';
import { AuthService } from '../services/auth.service';
import { DemoService } from '../services/demo.service';
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

        const user = new User();
        user.email = email;
        user.passwordHash = await AuthService.hashPassword(password);
        user.name = name;
        user.timezone = timezone || 'UTC';

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

  loginDemoUser = async (req: Request, res: Response) => {
    try {
      // Create or get existing demo user
      const demoUser = await DemoService.createDemoUser(this.em);
      
      // Generate token for demo user
      const token = AuthService.generateToken(demoUser);
      
      res.json({
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          timezone: demoUser.timezone
        },
        token,
        isDemo: true
      });
    } catch (error) {
      console.error('Demo login error:', error);
      res.status(500).json({ error: 'Demo login failed' });
    }
  };
}
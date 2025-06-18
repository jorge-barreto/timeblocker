import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/User';

export class DemoService {
  static async getDemoUser(em: EntityManager): Promise<User | null> {
    const demoEmail = 'demo@timeblocker.app';
    return await em.findOne(User, { email: demoEmail });
  }

  static async getDemoUserCredentials(): Promise<{ email: string; password: string }> {
    return {
      email: 'demo@timeblocker.app',
      password: 'demo123'
    };
  }
}
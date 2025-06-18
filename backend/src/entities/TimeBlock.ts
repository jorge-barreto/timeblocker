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
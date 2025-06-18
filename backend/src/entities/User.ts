import { Entity, PrimaryKey, Property, Collection, OneToMany, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Task } from './Task';
import { TimeBlock } from './TimeBlock';
import { PushSubscription } from '../types';

@Entity()
export class User {
  @PrimaryKey()
  id: string = v4();

  @Property()
  @Unique()
  email!: string;

  @Property()
  passwordHash!: string;

  @Property({ nullable: true })
  name?: string;

  @Property({ type: 'json', nullable: true })
  pushSubscriptions: PushSubscription[] = [];

  @Property({ nullable: true })
  dailyPlanningTime?: string; // HH:mm format

  @Property()
  timezone: string = 'UTC';

  @OneToMany(() => Task, task => task.user)
  tasks = new Collection<Task>(this);

  @OneToMany(() => TimeBlock, timeBlock => timeBlock.user)
  timeBlocks = new Collection<TimeBlock>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
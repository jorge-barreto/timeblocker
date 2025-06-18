import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Enum } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './User';
import { TimeBlock } from './TimeBlock';
import { TaskStatus, TaskPriority, RecurrenceSettings } from '../types';

@Entity()
export class Task {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  title!: string;

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Enum(() => TaskStatus)
  status: TaskStatus = TaskStatus.PENDING;

  @Enum(() => TaskPriority)
  priority: TaskPriority = TaskPriority.MEDIUM;

  @Property({ nullable: true })
  category?: string;

  @Property({ nullable: true })
  deadline?: Date;

  @Property({ nullable: true })
  estimatedMinutes?: number;

  @Property({ type: 'json', nullable: true })
  recurrence?: RecurrenceSettings;

  @ManyToOne(() => Task, { nullable: true })
  parentTask?: Task;

  @OneToMany(() => Task, task => task.parentTask)
  subtasks = new Collection<Task>(this);

  @OneToMany(() => TimeBlock, timeBlock => timeBlock.task)
  timeBlocks = new Collection<TimeBlock>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ persist: false })
  get totalMinutesWorked(): number {
    return this.timeBlocks
      .getItems()
      .reduce((total, block) => {
        const duration = (block.actualEnd || block.end).getTime() - block.start.getTime();
        return total + Math.floor(duration / 60000);
      }, 0);
  }
}
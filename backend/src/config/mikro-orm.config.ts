import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { User } from '../entities/User';
import { Task } from '../entities/Task';
import { TimeBlock } from '../entities/TimeBlock';
import path from 'path';

const config: Options<PostgreSqlDriver> = {
  entities: [User, Task, TimeBlock],
  dbName: process.env.DATABASE_URL,
  type: 'postgresql',
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    path: path.join(__dirname, '../../migrations'),
    pathTs: path.join(__dirname, '../../migrations'),
    glob: '!(*.d).{js,ts}',
  },
};

export default config;
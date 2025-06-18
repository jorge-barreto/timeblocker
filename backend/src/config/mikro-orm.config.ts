import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { User } from '../entities/User';
import { Task } from '../entities/Task';
import { TimeBlock } from '../entities/TimeBlock';
import { config, isDevelopment } from './env.config';
import path from 'path';

const mikroOrmConfig: Options<PostgreSqlDriver> = {
  entities: [User, Task, TimeBlock],
  clientUrl: config.DATABASE_URL,
  type: 'postgresql',
  debug: isDevelopment(),
  migrations: {
    path: path.join(__dirname, '../../migrations'),
    pathTs: path.join(__dirname, '../../migrations'),
    glob: '!(*.d).{js,ts}',
  },
};

export default mikroOrmConfig;
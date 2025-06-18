import { Migration } from '@mikro-orm/migrations';

export class Migration20240101000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE "user" (
        "id" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "name" varchar(255) NULL,
        "push_subscriptions" jsonb DEFAULT '[]',
        "daily_planning_time" varchar(255) NULL,
        "timezone" varchar(255) NOT NULL DEFAULT 'UTC',
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        CONSTRAINT "user_pkey" PRIMARY KEY ("id")
      );
    `);
    
    this.addSql('CREATE UNIQUE INDEX "user_email_unique" ON "user" ("email");');

    this.addSql(`
      CREATE TABLE "task" (
        "id" varchar(255) NOT NULL,
        "user_id" varchar(255) NOT NULL,
        "title" varchar(255) NOT NULL,
        "notes" text NULL,
        "status" varchar(255) NOT NULL DEFAULT 'PENDING',
        "priority" varchar(255) NOT NULL DEFAULT 'MEDIUM',
        "category" varchar(255) NULL,
        "deadline" timestamptz NULL,
        "estimated_minutes" int NULL,
        "recurrence" jsonb NULL,
        "parent_task_id" varchar(255) NULL,
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        CONSTRAINT "task_pkey" PRIMARY KEY ("id")
      );
    `);

    this.addSql('ALTER TABLE "task" ADD CONSTRAINT "task_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON UPDATE CASCADE;');
    this.addSql('ALTER TABLE "task" ADD CONSTRAINT "task_parent_task_id_foreign" FOREIGN KEY ("parent_task_id") REFERENCES "task" ("id") ON UPDATE CASCADE ON DELETE SET NULL;');

    this.addSql(`
      CREATE TABLE "time_block" (
        "id" varchar(255) NOT NULL,
        "user_id" varchar(255) NOT NULL,
        "task_id" varchar(255) NULL,
        "start" timestamptz NOT NULL,
        "end" timestamptz NOT NULL,
        "actual_end" timestamptz NULL,
        "title" varchar(255) NOT NULL,
        "category" varchar(255) NULL,
        "notes" text NULL,
        "notification" jsonb NULL,
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        CONSTRAINT "time_block_pkey" PRIMARY KEY ("id")
      );
    `);

    this.addSql('ALTER TABLE "time_block" ADD CONSTRAINT "time_block_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON UPDATE CASCADE;');
    this.addSql('ALTER TABLE "time_block" ADD CONSTRAINT "time_block_task_id_foreign" FOREIGN KEY ("task_id") REFERENCES "task" ("id") ON UPDATE CASCADE ON DELETE SET NULL;');
    this.addSql('CREATE INDEX "time_block_user_id_start_end_index" ON "time_block" ("user_id", "start", "end");');
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "time_block" CASCADE;');
    this.addSql('DROP TABLE IF EXISTS "task" CASCADE;');
    this.addSql('DROP TABLE IF EXISTS "user" CASCADE;');
  }
}
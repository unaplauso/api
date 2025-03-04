import { sql } from 'drizzle-orm';
import {
  check,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';
import { ProjectTable } from './project.schema';
import { UserTable } from './user.schema';

export enum ReportProjectReason {
  SPAM = 'spam',
  FRAUD = 'fraud',
  TOS_DISRESPECT = 'tos_disrespect',
  STOLEN_CONTENT = 'stolen_content',
}

export const ReportProjectReasonEnum = pgEnum(
  'report_project_reason',
  Object.values(ReportProjectReason) as [ReportProjectReason],
);

export const ReportProjectTable = pgTable(
  'report_project',
  {
    userId: integer()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    projectId: integer()
      .notNull()
      .references(() => ProjectTable.id, { onDelete: 'cascade' }),
    reason: ReportProjectReasonEnum(),
    message: varchar({ length: 500 }),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.projectId] }),
    check(
      'reason_or_message_check',
      sql`${table.reason} IS NOT NULL OR ${table.message} IS NOT NULL`,
    ),
  ],
);

export const InsertReportProjectSchema = v.pipe(
  v.omit(createInsertSchema(ReportProjectTable), ['userId', 'projectId']),
  v.check((x) => Boolean(x.reason ?? x.message)),
);

export type InsertReportProject = v.InferOutput<
  typeof InsertReportProjectSchema
>;

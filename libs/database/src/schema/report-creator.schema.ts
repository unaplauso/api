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
import { UserTable } from './user.schema';

export enum ReportCreatorReason {
  SPAM = 'spam',
  FRAUD = 'fraud',
  TOS_DISRESPECT = 'tos_disrespect',
  STOLEN_CONTENT = 'stolen_content',
}

export const ReportCreatorReasonEnum = pgEnum(
  'report_creator_reason',
  Object.values(ReportCreatorReason) as [ReportCreatorReason],
);

export const ReportCreatorTable = pgTable(
  'report_creator',
  {
    userId: integer()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    creatorId: integer()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    reason: ReportCreatorReasonEnum(),
    message: varchar({ length: 500 }),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.creatorId] }),
    check(
      'reason_or_message_check',
      sql`${table.reason} IS NOT NULL OR ${table.message} IS NOT NULL`,
    ),
  ],
);

export const InsertReportCreatorSchema = v.pipe(
  v.omit(createInsertSchema(ReportCreatorTable), ['userId', 'creatorId']),
  v.check((x) => Boolean(x.reason ?? x.message)),
);

export type InsertReportCreator = v.InferOutput<
  typeof InsertReportCreatorSchema
>;

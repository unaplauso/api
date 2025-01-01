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
import { InferInput, pipe, check as vcheck } from 'valibot';
import { UserTable } from './user.schema';

export const ReportReasonEnum = pgEnum('report_reason', [
  'spam',
  'fraud',
  'tos_disrespect',
  'stolen_content',
]);

export const ReportTable = pgTable(
  'report',
  {
    userId: integer()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    reportedId: integer()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    reason: ReportReasonEnum(),
    message: varchar({ length: 500 }),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.reportedId] }),
    check(
      'reason_or_message',
      sql`${table.reason} IS NOT NULL OR ${table.message} IS NOT NULL`,
    ),
  ],
);

export const InsertReportSchema = pipe(
  createInsertSchema(ReportTable),
  vcheck((x) => Boolean(x.reason ?? x.message)),
);

export type InsertReport = InferInput<typeof InsertReportSchema>;

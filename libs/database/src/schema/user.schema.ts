import { relations, sql } from 'drizzle-orm';
import {
  check,
  pgTable,
  serial,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';
import { lowerIndex, trgmIndex } from '../functions';
import { FileTable } from './file.schema';
import { UserTopicTable } from './user-topic.schema';

export const UserTable = pgTable(
  'user',
  {
    id: serial().primaryKey(),
    displayName: varchar({ length: 64 }),
    username: varchar({ length: 64 }),
    email: varchar({ length: 320 }).notNull(),
    profilePicFileId: uuid().references(() => FileTable.id, {
      onDelete: 'set null',
    }),
    profileBannerFileId: uuid().references(() => FileTable.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [
    check('username_format_check', sql`${table.username} ~ '^[a-zA-Z0-9_-]+$'`),
    lowerIndex(table.username),
    trgmIndex(table.username, 'gist'),
    lowerIndex(table.email),
  ],
);

export const UserRelations = relations(UserTable, ({ many }) => ({
  userTopics: many(UserTopicTable),
}));

export const InsertUserSchema = createInsertSchema(UserTable, {
  email: (schema) => v.pipe(schema, v.email()),
  username: v.optional(v.pipe(v.string(), v.regex(/^[a-zA-Z0-9_-]+$/))),
});

export type InsertUser = v.InferOutput<typeof InsertUserSchema>;

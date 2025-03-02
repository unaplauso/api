import { pgTable, serial, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';
import { FileTable } from './file.schema';

export const UserTable = pgTable('user', {
  id: serial().primaryKey(),
  username: varchar({ length: 64 }).unique(),
  email: varchar({ length: 320 }).unique().notNull(),
  profilePicFileId: uuid().references(() => FileTable.id, {
    onDelete: 'set null',
  }),
  profileBannerFileId: uuid().references(() => FileTable.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp().notNull().defaultNow(),
});

export const InsertUserSchema = createInsertSchema(UserTable, {
  email: (schema) => v.pipe(schema, v.email()),
});

export type InsertUser = v.InferOutput<typeof InsertUserSchema>;

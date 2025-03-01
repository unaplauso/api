import { pgTable, serial, uuid, varchar } from 'drizzle-orm/pg-core';
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
});

export const InsertUserSchema = createInsertSchema(UserTable, {
  email: (schema) => v.pipe(schema, v.email()),
});

export type InsertUser = v.InferInput<typeof InsertUserSchema>;

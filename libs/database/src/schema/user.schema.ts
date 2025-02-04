import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';

export const UserTable = pgTable('user', {
  id: serial('id').primaryKey(),
  username: varchar({ length: 64 }).unique(),
  email: varchar({ length: 320 }).unique().notNull(),
});

export const InsertUserSchema = createInsertSchema(UserTable, {
  email: (schema) => v.pipe(schema, v.email()),
});

export type InsertUser = v.InferInput<typeof InsertUserSchema>;

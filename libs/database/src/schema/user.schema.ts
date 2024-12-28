import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-valibot';
import { email, InferInput, pipe } from 'valibot';

export const UserTable = pgTable('user', {
  id: serial('id').primaryKey(),
  username: varchar({ length: 64 }).unique(),
  email: varchar({ length: 320 }).unique().notNull(),

  // one to one?
  name: varchar({ length: 128 }),
});

export const UserInsertSchema = createInsertSchema(UserTable, {
  email: (schema) => pipe(schema, email()),
});

export type UserInsertDto = InferInput<typeof UserInsertSchema>;
// export const userSelectSchema = createSelectSchema(user);
// export type userSelectDto = typeof user.$inferSelect;

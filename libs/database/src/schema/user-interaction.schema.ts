import { integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';
import { UserTable } from './user.schema';

export const UserInteractionTable = pgTable('user_interaction', {
  id: serial().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => UserTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp().notNull().defaultNow(),
});

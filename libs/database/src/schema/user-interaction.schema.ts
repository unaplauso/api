import { bigserial, integer, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { UserTable } from './user.schema';

export const UserInteractionTable = pgTable('user_interaction', {
  id: bigserial({ mode: 'number' }).primaryKey(),
  userId: integer()
    .notNull()
    .references(() => UserTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp().notNull().defaultNow(),
});

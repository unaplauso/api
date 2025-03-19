import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { UserTable } from './user.schema';

export const FavoriteCreatorTable = pgTable(
  'favorite_creator',
  {
    userId: integer()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    creatorId: integer()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.creatorId] })],
);

export const FavoriteCreatorRelations = relations(
  FavoriteCreatorTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [FavoriteCreatorTable.userId],
      references: [UserTable.id],
    }),
    creator: one(UserTable, {
      fields: [FavoriteCreatorTable.userId],
      references: [UserTable.id],
    }),
  }),
);

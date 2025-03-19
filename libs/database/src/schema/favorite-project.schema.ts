import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { ProjectTable } from './project.schema';
import { UserTable } from './user.schema';

export const FavoriteProjectTable = pgTable(
  'favorite_project',
  {
    userId: integer()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    projectId: integer()
      .notNull()
      .references(() => ProjectTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.projectId] })],
);

export const FavoriteProjectRelations = relations(
  FavoriteProjectTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [FavoriteProjectTable.userId],
      references: [UserTable.id],
    }),
    project: one(ProjectTable, {
      fields: [FavoriteProjectTable.projectId],
      references: [ProjectTable.id],
    }),
  }),
);

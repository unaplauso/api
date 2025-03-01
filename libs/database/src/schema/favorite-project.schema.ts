import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';
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
  },
  (table) => [primaryKey({ columns: [table.userId, table.projectId] })],
);

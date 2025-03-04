import { bigserial, integer, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { ProjectTable } from './project.schema';

export const ProjectInteractionTable = pgTable('project_interaction', {
  id: bigserial({ mode: 'number' }).primaryKey(),
  projectId: integer()
    .notNull()
    .references(() => ProjectTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp().notNull().defaultNow(),
});

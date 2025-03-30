import { integer, pgTable, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { Project } from './project.schema';
import { User } from './user.schema';

export const FavoriteProject = pgTable(
	'favorite_project',
	{
		userId: integer()
			.notNull()
			.references(() => User.id, { onDelete: 'cascade' }),
		projectId: integer()
			.notNull()
			.references(() => Project.id, { onDelete: 'cascade' }),
		createdAt: timestamp().notNull().defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.projectId] })],
);

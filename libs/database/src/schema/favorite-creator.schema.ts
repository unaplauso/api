import { integer, pgTable, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { User } from './user.schema';

export const FavoriteCreator = pgTable(
	'favorite_creator',
	{
		userId: integer()
			.notNull()
			.references(() => User.id, { onDelete: 'cascade' }),
		creatorId: integer()
			.notNull()
			.references(() => User.id, { onDelete: 'cascade' }),
		createdAt: timestamp().notNull().defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.creatorId] })],
);

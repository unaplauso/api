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

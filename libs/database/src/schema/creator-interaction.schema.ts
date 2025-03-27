import {
	bigserial,
	index,
	integer,
	pgTable,
	timestamp,
} from 'drizzle-orm/pg-core';
import { UserTable } from './user.schema';

export const CreatorInteractionTable = pgTable(
	'creator_interaction',
	{
		id: bigserial({ mode: 'number' }).primaryKey(),
		creatorId: integer()
			.notNull()
			.references(() => UserTable.id, { onDelete: 'cascade' }),
		createdAt: timestamp().notNull().defaultNow(),
	},
	(table) => [
		index('creator_interaction_project_id_idx').on(table.creatorId),
		index('creator_interaction_created_at_idx').on(table.createdAt),
	],
);

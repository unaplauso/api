import {
	bigserial,
	index,
	integer,
	pgTable,
	timestamp,
} from 'drizzle-orm/pg-core';
import { User } from './user.schema';

export const CreatorInteraction = pgTable(
	'creator_interaction',
	{
		id: bigserial({ mode: 'number' }).primaryKey(),
		creatorId: integer()
			.notNull()
			.references(() => User.id, { onDelete: 'cascade' }),
		createdAt: timestamp().notNull().defaultNow(),
	},
	(table) => [
		index('creator_interaction_project_id_idx').on(table.creatorId),
		index('creator_interaction_created_at_idx').on(table.createdAt),
	],
);

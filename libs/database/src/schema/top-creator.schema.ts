import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { UserTable } from './user.schema';

// TODO:
export const TopCreatorView = pgMaterializedView('top_creator').as((qb) =>
	qb.select({ id: UserTable.id }).from(UserTable),
);

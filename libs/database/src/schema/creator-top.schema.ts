import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { User } from './user.schema';

export const CreatorTopMat = pgMaterializedView('creator_top').as((qb) =>
	qb.select({ id: User.id }).from(User),
);

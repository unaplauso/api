import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { Topic } from './topic.schema';
import { User } from './user.schema';

export const UserTopic = pgTable(
	'user_topic',
	{
		userId: integer()
			.notNull()
			.references(() => User.id, { onDelete: 'cascade' }),
		topicId: integer()
			.notNull()
			.references(() => Topic.id, { onDelete: 'cascade' }),
	},
	(table) => [primaryKey({ columns: [table.userId, table.topicId] })],
);

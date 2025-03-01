import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { TopicTable } from './topic.schema';
import { UserTable } from './user.schema';

export const UserTopicTable = pgTable(
  'user_topic',
  {
    userId: integer()
      .notNull()
      .references(() => UserTable.id, { onDelete: 'cascade' }),
    topicId: integer()
      .notNull()
      .references(() => TopicTable.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.topicId] })],
);

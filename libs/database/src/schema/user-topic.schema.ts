import { relations } from 'drizzle-orm';
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

export const UserTopicRelations = relations(UserTopicTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [UserTopicTable.userId],
    references: [UserTable.id],
  }),
  topic: one(TopicTable, {
    fields: [UserTopicTable.topicId],
    references: [TopicTable.id],
  }),
}));

import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const TopicTable = pgTable('topic', {
  id: serial().primaryKey(),
  name: varchar({ length: 32 }).unique().notNull(),
});

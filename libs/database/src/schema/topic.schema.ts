import { pgTable, smallserial, varchar } from 'drizzle-orm/pg-core';
import { trgmIndex } from '../functions';

export const TopicTable = pgTable(
  'topic',
  {
    id: smallserial().primaryKey(),
    name: varchar({ length: 32 }).unique().notNull(),
    aliases: varchar({ length: 320 }).notNull(),
  },
  (table) => [trgmIndex(table.aliases), trgmIndex(table.name)],
);

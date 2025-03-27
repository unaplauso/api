import Big from 'big.js';
import {
	integer,
	numeric,
	pgTable,
	serial,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { FileTable } from './file.schema';
import { UserTable } from './user.schema';

export const ProjectTable = pgTable('project', {
	id: serial().primaryKey(),
	title: varchar({ length: 64 }).notNull(),
	creatorId: integer()
		.notNull()
		.references(() => UserTable.id, { onDelete: 'cascade' }),
	deadline: timestamp(),
	quotation: numeric().notNull().default(Big(1).toPrecision()),
	goal: numeric(),
	thumbnailFileId: uuid().references(() => FileTable.id, {
		onDelete: 'set null',
	}),
	description: varchar({ length: 10000 }),
	createdAt: timestamp().notNull().defaultNow(),
});

/* -- TRIGGERS
CREATE TRIGGER update_project_thumbnail_file
AFTER UPDATE OF thumbnail_file_id ON "project"
FOR EACH ROW EXECUTE FUNCTION delete_old_file('thumbnail_file_id');
*/

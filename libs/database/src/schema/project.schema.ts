import Big from 'big.js';
import {
	boolean,
	integer,
	numeric,
	pgTable,
	serial,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { File } from './file.schema';
import { User } from './user.schema';

export enum ProjectStatus {
	OPEN = 'open',
	CANCELED = 'canceled',
	FAILED = 'failed',
	COMPLETED = 'completed',
}

export const Project = pgTable('project', {
	id: serial().primaryKey(),
	title: varchar({ length: 64 }).notNull(),
	creatorId: integer()
		.notNull()
		.references(() => User.id, { onDelete: 'cascade' }),
	deadline: timestamp(),
	quotation: numeric().notNull().default(Big(1).toPrecision()),
	goal: numeric(),
	thumbnailFileId: uuid().references(() => File.id, {
		onDelete: 'set null',
	}),
	description: varchar({ length: 10000 }),
	isCanceled: boolean().notNull().default(false),
	createdAt: timestamp().notNull().defaultNow(),
});

/* -- TRIGGERS
CREATE TRIGGER update_project_thumbnail_file
AFTER UPDATE OF thumbnail_file_id ON "project"
FOR EACH ROW EXECUTE FUNCTION delete_old_file('thumbnail_file_id');
*/

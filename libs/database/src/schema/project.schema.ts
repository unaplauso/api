import { type SQL, gte, isNull, or } from 'drizzle-orm';
import {
	boolean,
	check,
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

export const Project = pgTable(
	'project',
	{
		id: serial().primaryKey(),
		title: varchar({ length: 64 }).notNull(),
		creatorId: integer()
			.notNull()
			.references(() => User.id, { onDelete: 'cascade' }),
		deadline: timestamp({ mode: 'string', precision: 0 }),
		quotation: numeric().notNull().default('1'),
		fee: numeric().notNull().default('0.05'),
		goal: numeric(),
		thumbnailFileId: uuid().references(() => File.id, {
			onDelete: 'set null',
		}),
		description: varchar({ length: 10000 }),
		isCanceled: boolean().notNull().default(false),
		createdAt: timestamp().notNull().defaultNow(),
	},
	(table) => [
		check(
			'goal_gte_quotation_check',
			or(
				isNull(table.goal),
				isNull(table.quotation),
				gte(table.goal, table.quotation),
			) as SQL,
		),
	],
);

/* TRIGGERS
- update_project_thumbnail_file
*/

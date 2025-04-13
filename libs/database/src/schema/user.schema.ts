import { USERNAME_REGEX } from '@unaplauso/validation/utils';
import {
	check,
	pgTable,
	serial,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { lowerIndex, matchRegex } from '../functions';
import { File } from './file.schema';

export const User = pgTable(
	'user',
	{
		id: serial().primaryKey(),
		username: varchar({ length: 32 }),
		displayName: varchar({ length: 64 }),
		email: varchar({ length: 320 }).notNull(),
		profilePicFileId: uuid().references(() => File.id, {
			onDelete: 'set null',
		}),
		profileBannerFileId: uuid().references(() => File.id, {
			onDelete: 'set null',
		}),
		createdAt: timestamp().notNull().defaultNow(),
	},
	(table) => [
		check(
			'username_format_check',
			matchRegex(table.username, USERNAME_REGEX, true),
		),
		lowerIndex(table.username),
		lowerIndex(table.email),
	],
);

/* TRIGGERS
- update_user_profile_pic_file
- update_user_profile_banner_file
- user_inserted
*/

export type InsertUser = typeof User.$inferInsert;

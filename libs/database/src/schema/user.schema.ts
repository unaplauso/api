import { USERNAME_REGEX } from '@unaplauso/validation/utils';
import {
	check,
	pgTable,
	serial,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { lowerIndex, matchRegex, trgmIndex } from '../functions';
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
		trgmIndex(table.username, 'gist'),
		lowerIndex(table.email),
	],
);

/* -- TRIGGERS
CREATE TRIGGER update_user_profile_pic_file
AFTER UPDATE OF profile_pic_file_id ON "user"
FOR EACH ROW EXECUTE FUNCTION delete_old_file('profile_pic_file_id');

CREATE TRIGGER update_user_profile_banner_file
AFTER UPDATE OF profile_banner_file_id ON "user"
FOR EACH ROW EXECUTE FUNCTION delete_old_file('profile_banner_file_id');
*/

export type InsertUser = typeof User.$inferInsert;

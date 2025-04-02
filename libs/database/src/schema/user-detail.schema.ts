import {
	FACEBOOK_USER_REGEX,
	GITHUB_USER_REGEX,
	INSTAGRAM_USER_REGEX,
	TIKTOK_USER_REGEX,
	URL_REGEX,
	X_USER_REGEX,
} from '@unaplauso/validation/utils';
import Big from 'big.js';
import { check, integer, numeric, pgTable, varchar } from 'drizzle-orm/pg-core';
import { matchRegex } from '../functions';
import { User } from './user.schema';

export const UserDetail = pgTable(
	'user_detail',
	{
		id: integer()
			.notNull()
			.primaryKey()
			.references(() => User.id, { onDelete: 'cascade' }),
		description: varchar({ length: 10000 }),
		customThanks: varchar({ length: 1000 }),
		location: varchar({ length: 64 }),
		quotation: numeric().notNull().default(Big(1).toPrecision()),
		personalUrl: varchar({ length: 255 }),
		instagramUser: varchar({ length: 100 }),
		facebookUser: varchar({ length: 100 }),
		xUser: varchar({ length: 50 }),
		tiktokUser: varchar({ length: 50 }),
		githubUser: varchar({ length: 100 }),
	},
	(table) => [
		check('personal_url_check', matchRegex(table.personalUrl, URL_REGEX, true)),
		check(
			'instagram_user_check',
			matchRegex(table.instagramUser, INSTAGRAM_USER_REGEX, true),
		),
		check(
			'facebook_user_check',
			matchRegex(table.facebookUser, FACEBOOK_USER_REGEX, true),
		),
		check('x_user_check', matchRegex(table.xUser, X_USER_REGEX, true)),
		check(
			'tiktok_user_check',
			matchRegex(table.tiktokUser, TIKTOK_USER_REGEX, true),
		),
		check(
			'github_user_check',
			matchRegex(table.githubUser, GITHUB_USER_REGEX, true),
		),
	],
);

/* TRIGGERS
- user_inserted
*/

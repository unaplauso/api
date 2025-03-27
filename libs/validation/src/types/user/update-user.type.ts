import { UserDetailTable, UserTable } from '@unaplauso/database';
import { createUpdateSchema } from 'drizzle-valibot';
import * as v from 'valibot';
import {
	FACEBOOK_USER_REGEX,
	GITHUB_USER_REGEX,
	INSTAGRAM_USER_REGEX,
	TIKTOK_USER_REGEX,
	URL_REGEX,
	USERNAME_REGEX,
	X_USER_REGEX,
} from '../../utils';

export const UpdateUserSchema = v.omit(
	v.object({
		...createUpdateSchema(UserTable, {
			username: v.pipe(v.string(), v.regex(USERNAME_REGEX)),
		}).entries,
		...createUpdateSchema(UserDetailTable, {
			personalUrl: v.nullish(v.pipe(v.string(), v.regex(URL_REGEX))),
			instagramUser: v.nullish(
				v.pipe(v.string(), v.regex(INSTAGRAM_USER_REGEX)),
			),
			facebookUser: v.nullish(v.pipe(v.string(), v.regex(FACEBOOK_USER_REGEX))),
			xUser: v.nullish(v.pipe(v.string(), v.regex(X_USER_REGEX))),
			tiktokUser: v.nullish(v.pipe(v.string(), v.regex(TIKTOK_USER_REGEX))),
			githubUser: v.nullish(v.pipe(v.string(), v.regex(GITHUB_USER_REGEX))),
		}).entries,
	}),
	['createdAt', 'id', 'email', 'profileBannerFileId', 'profilePicFileId'],
);

export type TUpdateUser = v.InferOutput<typeof UpdateUserSchema>;

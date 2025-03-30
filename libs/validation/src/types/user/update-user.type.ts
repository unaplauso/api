import { User, UserDetail } from '@unaplauso/database';
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
	vStringFloat,
} from '../../utils';

export const UpdateUserSchema = v.omit(
	v.strictObject({
		...createUpdateSchema(User, {
			username: v.optional(
				v.pipe(v.string(), v.trim(), v.regex(USERNAME_REGEX)),
			),
		}).entries,
		...createUpdateSchema(UserDetail, {
			quotation: v.optional(vStringFloat),
			personalUrl: v.optional(v.pipe(v.string(), v.trim(), v.regex(URL_REGEX))),
			instagramUser: v.optional(
				v.pipe(v.string(), v.trim(), v.regex(INSTAGRAM_USER_REGEX)),
			),
			facebookUser: v.optional(
				v.pipe(v.string(), v.trim(), v.regex(FACEBOOK_USER_REGEX)),
			),
			xUser: v.optional(v.pipe(v.string(), v.trim(), v.regex(X_USER_REGEX))),
			tiktokUser: v.optional(
				v.pipe(v.string(), v.trim(), v.regex(TIKTOK_USER_REGEX)),
			),
			githubUser: v.optional(
				v.pipe(v.string(), v.trim(), v.regex(GITHUB_USER_REGEX)),
			),
		}).entries,
	}),
	['createdAt', 'id', 'email', 'profileBannerFileId', 'profilePicFileId'],
);

export type TUpdateUser = v.InferOutput<typeof UpdateUserSchema>;

import type { TTableObj } from '@unaplauso/database/t-table-obj.type';
import { sql } from 'drizzle-orm';

export const sqlRegex = (rgx: RegExp) => sql.raw(`'${rgx.source}'`);

export const matchRegex = (v: TTableObj, rgx: RegExp, isNullable = false) =>
	isNullable
		? sql<boolean>`${v} IS NULL OR ${v} ~ ${sqlRegex(rgx)}`
		: sql<boolean>`${v} ~ ${sqlRegex(rgx)}`;

export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{2,32}$/;

export const URL_REGEX =
	/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

export const INSTAGRAM_USER_REGEX = /^@?[a-zA-Z0-9._]{1,30}$/;
export const FACEBOOK_USER_REGEX = /^[a-zA-Z0-9.]{5,50}$/;
export const X_USER_REGEX = /^@?[a-zA-Z0-9_]{1,15}$/;
export const TIKTOK_USER_REGEX = /^@?[a-zA-Z0-9_.]{1,24}$/;
export const GITHUB_USER_REGEX =
	/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

import { sql } from 'drizzle-orm';
import type { TSQLObject } from '../helpers';

export const sqlRegex = (rgx: RegExp) => sql.raw(`'${rgx.source}'`);

export const matchRegex = (v: TSQLObject, rgx: RegExp, isNullable = false) =>
	isNullable
		? sql<boolean>`${v} IS NULL OR ${v} ~ ${sqlRegex(rgx)}`
		: sql<boolean>`${v} ~ ${sqlRegex(rgx)}`;

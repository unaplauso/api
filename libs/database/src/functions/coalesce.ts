import { sql } from 'drizzle-orm';
import type { InferSQLType, TSQLObject } from '../helpers';

type NonEmpty<T> = T extends null | undefined | [] ? never : T;
export const coalesce = <T extends TSQLObject[]>(...values: T) => {
	return sql<
		NonEmpty<InferSQLType<T[number]>>
	>`coalesce(${sql.join(values, sql.raw(', '))})`;
};

export const sqlJsonArray = sql<[]>`'[]'::json`;

export const sqlSmallintArray = sql<[]>`ARRAY[]::smallint[]`;

export const sqlNow = sql<Date>`NOW()`;

export const sqlStr0 = sql<string>`0`;

export const sql0 = sql<number>`0`;

export const sqlNull = <T>(alias: string) => sql<T | null>`null`.as(alias);

export const sqlEmptyStr = sql<string>`''`;

export const sqlFalse = sql<boolean>`false`;

export const sqlTrue = sql<boolean>`true`;

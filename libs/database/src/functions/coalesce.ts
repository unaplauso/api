import { type SQL, sql } from 'drizzle-orm';

export const coalesce = <T>(...values: SQL<T>[]) =>
	sql<T>`coalesce(${sql.join(values, sql.raw(', '))})`;

export const sqlJsonArray = sql<[]>`'[]'::json`;

export const sqlNull = sql<null>`null`;

export const sqlNow = sql<Date>`NOW()`;

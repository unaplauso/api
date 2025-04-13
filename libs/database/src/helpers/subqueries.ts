import { type Table, sql } from 'drizzle-orm';
import type { TSQLObject } from '.';

export const countWhereSq = (
	from: Table,
	where: TSQLObject,
	row: TSQLObject = sql`*`,
) =>
	sql<string>`coalesce((select count(${row}) from ${from} where ${where}), 0)`;

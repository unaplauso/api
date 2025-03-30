import { type Table, sql } from 'drizzle-orm';
import type { TSQLObject } from '.';

export const countWhereSq = (from: Table, where: TSQLObject) =>
	sql<string>`coalesce((select count(*) from ${from} where ${where}), 0)`;

import { type SQL, sql } from 'drizzle-orm';
import type { InferSQLType, TSQLObject } from '../helpers';

export function jsonAgg<T>(query: SQL<T>, filterWhere?: TSQLObject) {
	const q = sql`json_agg(${query})`;
	if (filterWhere) q.append(sql` filter (where ${filterWhere})`);
	return q as SQL<T[]>;
}

export function arrayAgg<T extends TSQLObject>(query: T) {
	return sql<InferSQLType<T>[]>`array_agg(${query})`;
}

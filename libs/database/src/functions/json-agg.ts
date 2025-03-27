import { type SQL, sql } from 'drizzle-orm';
import type { TTableObj } from '../t-table-obj.type';
import { coalesce, sqlJsonArray } from './coalesce';

export function jsonAgg<T>(query: SQL<T>, filterWhere?: TTableObj) {
	const q = sql`json_agg(${query})`;
	if (filterWhere) q.append(sql` filter (where ${filterWhere})`);
	return q as SQL<T[]>;
}

export function emptiableJsonAgg<T>(query: SQL<T>, filterWhere?: TTableObj) {
	return coalesce(jsonAgg(query, filterWhere), sqlJsonArray);
}

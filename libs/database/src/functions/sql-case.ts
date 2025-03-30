import { type Column, type SQL, sql } from 'drizzle-orm';
import type { InferSQLType, TSQLObject } from '../helpers';

export function sqlCase<T>(
	elseValue: TSQLObject<T> | T,
	...whenThens: SQL<T>[]
) {
	const q = sql<
		T extends TSQLObject ? InferSQLType<T> : T
	>`case ${sql.join(whenThens, sql.raw(' '))}`;
	if (elseValue) q.append(sql` else ${elseValue} end`);
	else q.append(sql` end`);
	return q;
}

export function whenThen<T>(whenQuery: SQL, thenQuery: TSQLObject<T> | T) {
	return sql<
		T extends TSQLObject ? InferSQLType<T> : T
	>`when ${whenQuery} then ${thenQuery}`;
}

export function caseWhenNull<T>(col: Column, query: TSQLObject<T> | T) {
	return sql<
		T extends TSQLObject ? InferSQLType<T> : T | null
	>`case when ${col} is not null then ${query} else null end`;
}

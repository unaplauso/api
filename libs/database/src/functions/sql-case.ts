import { type Column, type SQL, sql } from 'drizzle-orm';
import type { TTableObj } from '../t-table-obj.type';

export function sqlCase<T>(
	whenThens: TTableObj<T>[],
	elseValue?: TTableObj<T>,
) {
	const q = sql<T>`case ${sql.join(whenThens, sql.raw(' '))}`;
	if (elseValue) q.append(sql` else ${elseValue} end`);
	else q.append(sql` end`);
	return q;
}

export function whenThen<T>(whenQuery: SQL, thenQuery: TTableObj<T>) {
	return sql<T>`when ${whenQuery} then ${thenQuery}`;
}

export function caseWhenNull<T>(col: Column, query: TTableObj<T>) {
	return sql<T | null>`case when ${col} is null then null else ${query} end`;
}

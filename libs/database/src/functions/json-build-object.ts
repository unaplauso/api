import { type Column, type GetColumnData, type SQL, sql } from 'drizzle-orm';
import type { TTableObj } from '../t-table-obj.type';

export function jsonBuildObject<T, TObj extends Record<string, TTableObj<T>>>(
	obj: TObj,
): SQL<{
	[K in keyof TObj]: TObj[K] extends SQL<infer U>
		? U
		: TObj[K] extends Column
			? GetColumnData<TObj[K]>
			: TObj[K];
}> {
	const chunks = Object.keys(obj).map((k) => sql`'${sql.raw(k)}', ${obj[k]}`);
	return sql`json_build_object(${sql.join(chunks, sql.raw(', '))})`;
}

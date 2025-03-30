import { sql } from 'drizzle-orm';
import type { InferSQLType, TSQLObject } from '../helpers';

export function jsonBuildObject<TObj extends Record<string, TSQLObject>>(
	obj: TObj,
) {
	const chunks = Object.keys(obj).map((k) => sql`'${sql.raw(k)}', ${obj[k]}`);
	return sql<{
		[K in keyof TObj]: InferSQLType<TObj[K]>;
	}>`json_build_object(${sql.join(chunks, sql.raw(', '))})`;
}

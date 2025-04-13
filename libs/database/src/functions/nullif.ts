import { sql } from 'drizzle-orm';
import type { InferSQLType, TSQLObject } from '../helpers';

export const nullif = <T extends TSQLObject>(
	v: T,
	constraint: T | InferSQLType<T>,
) => {
	return sql<InferSQLType<T> | null>`nullif(${v}, ${constraint})`;
};

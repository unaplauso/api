import type { Column, GetColumnData, SQL } from 'drizzle-orm';

export type TSQLObject<T = unknown> = Column | SQL<T> | SQL.Aliased<T>;

export type InferSQLType<TObj extends TSQLObject | TSQLObject[]> =
	TObj extends Column
		? GetColumnData<TObj>
		: TObj extends SQL.Aliased<infer InferredAliasedT>
			? InferredAliasedT
			: TObj extends SQL<infer InferredT>
				? InferredT
				: never;

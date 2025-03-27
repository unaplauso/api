import { sql } from 'drizzle-orm';
import { type AnyPgColumn, index } from 'drizzle-orm/pg-core';

export function trgmIndex(col: AnyPgColumn, operator: 'gin' | 'gist' = 'gin') {
	return index(col.uniqueName?.replace('unique', 'trgm')).using(
		operator,
		operator === 'gin' ? sql`${col} gin_trgm_ops` : sql`${col} gist_trgm_ops`,
	);
}

export function wordSimilarity(col: AnyPgColumn, search: string) {
	return sql`word_similarity(${search}, ${col})`;
}

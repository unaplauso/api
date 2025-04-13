import { type Column, sql } from 'drizzle-orm';
import { index } from 'drizzle-orm/pg-core';
import type { TSQLObject } from '../helpers';

export function trgmIndex(col: Column, operator: 'gin' | 'gist' = 'gin') {
	return index(col.uniqueName?.replace('unique', 'trgm')).using(
		operator,
		operator === 'gin' ? sql`${col} gin_trgm_ops` : sql`${col} gist_trgm_ops`,
	);
}

export function wordSimilarity(col: TSQLObject, search: string) {
	return sql`word_similarity(${search}, ${col})`;
}

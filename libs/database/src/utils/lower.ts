import { eq, SQL, sql } from 'drizzle-orm';
import { AnyPgColumn, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const lower = (col: AnyPgColumn) => sql`lower(${col})`;

export function lowerIndex(col: AnyPgColumn, unique = true) {
  const query: SQL = lower(col);
  const name = unique
    ? `${col.uniqueName}_lower`
    : col.uniqueName?.replace('unique', 'lower');
  return unique ? uniqueIndex(name).on(query) : index(name).on(query);
}

export function lowerEq(col: AnyPgColumn, str: string) {
  return eq(lower(col), str.toLowerCase());
}

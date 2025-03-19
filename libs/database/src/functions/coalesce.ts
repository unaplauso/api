import { SQL, sql } from 'drizzle-orm';

export function coalesce<T>(query: SQL<T>, alt: SQL<T>) {
  return sql<T>`coalesce(${query}, ${alt})`;
}

export const sqlJsonArray = sql<[]>`'[]'::json`;

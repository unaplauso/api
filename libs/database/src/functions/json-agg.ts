import { SQL, sql } from 'drizzle-orm';
import { TTableObj } from '../t-table-obj.type';

export function jsonAgg<T>(query: SQL<T>, filterWhere?: TTableObj) {
  const q = sql`json_agg(${query})`;
  if (filterWhere) q.append(sql` filter (where ${filterWhere})`);
  return q as SQL<T[]>;
}

import { asc, desc, SQL } from 'drizzle-orm';
import { PgColumn, PgSelect } from 'drizzle-orm/pg-core';
import { Pagination } from './pagination.schema';

export function withPagination<T extends PgSelect>(
  column: PgColumn | SQL | SQL.Aliased,
  dto: Pagination,
  qb: T,
) {
  return qb
    .orderBy(dto.order === 'asc' ? asc(column) : desc(column))
    .limit(dto.pageSize)
    .offset((dto.page - 1) * dto.pageSize);
}

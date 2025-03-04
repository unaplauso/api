import * as v from 'valibot';
import { CreatePaginationSchema } from './pagination.schema';

export const PaginationWithSearchSchema = <T extends string>(
  keys: T[],
  defaults?: {
    orderBy?: T;
    order?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  },
  extend?: v.ObjectEntries,
) =>
  v.object({
    ...CreatePaginationSchema(keys, defaults, extend).entries,
    search: v.optional(v.string()),
  });

export const DefaultPaginationWithSearchSchema = PaginationWithSearchSchema([]);

export type PaginationWithSearch<T = undefined> = Omit<
  v.InferOutput<typeof DefaultPaginationWithSearchSchema>,
  'orderBy'
> & {
  orderBy?: T | undefined;
};

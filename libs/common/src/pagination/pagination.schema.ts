import * as v from 'valibot';

export const CreatePaginationSchema = <T extends string>(
  keys: T[],
  defaults?: {
    orderBy?: T;
    order?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  },
) =>
  v.object({
    orderBy: v.optional(
      v.union(keys.map((s) => v.literal(s))),
      defaults?.orderBy ?? keys[0],
    ),
    order: v.optional(
      v.union([v.literal('asc'), v.literal('desc')]),
      defaults?.order ?? 'asc',
    ),
    page: v.optional(
      v.pipe(
        v.union([v.string(), v.number()]),
        v.transform(parseInt),
        v.integer(),
        v.minValue(1),
      ),
      defaults?.page ?? 1,
    ),
    pageSize: v.optional(
      v.pipe(
        v.union([v.string(), v.number()]),
        v.transform(parseInt),
        v.integer(),
        v.minValue(1),
        v.toMaxValue(100),
      ),
      defaults?.pageSize ?? 100,
    ),
  });

export const DefaultPaginationSchema = CreatePaginationSchema([]);

export type Pagination<T = undefined> = Omit<
  v.InferOutput<typeof DefaultPaginationSchema>,
  'orderBy'
> & {
  orderBy?: T | undefined;
};

export type WithPagination<T = undefined, K = undefined> = {
  pagination: Pagination<keyof K>;
} & T;

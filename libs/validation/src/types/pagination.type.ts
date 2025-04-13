import * as v from 'valibot';
import { vStringInt } from '../utils/v-string-type';

export const CreatePaginationSchema = <T extends string | never>(
	orderKeys?: readonly T[],
	defaults?: {
		orderBy?: T;
		order?: 'asc' | 'desc';
		page?: number;
		pageSize?: number;
		search?: string;
	},
) =>
	v.strictObject({
		orderBy: v.optional(
			v.picklist(orderKeys ?? []),
			defaults?.orderBy ?? orderKeys?.at(0),
		),
		order: v.optional(
			v.picklist(['asc', 'desc'] as const),
			defaults?.order ?? 'asc',
		),
		page: v.optional(v.pipe(vStringInt, v.minValue(1)), defaults?.page ?? 1),
		pageSize: v.optional(
			v.pipe(vStringInt, v.minValue(1), v.toMaxValue(100)),
			defaults?.pageSize ?? 100,
		),
		search: v.optional(
			v.pipe(
				v.string(),
				v.nonEmpty(),
				v.transform((s) => s.trim().toLowerCase()),
				v.trim(),
			),
		),
	});

export const PaginationSchema = v.omit(CreatePaginationSchema(), ['orderBy']);

export type Pagination<T = never> = v.InferOutput<typeof PaginationSchema> & {
	orderBy: T;
};

import * as v from 'valibot';
import { vStringBoolean, vStringInt } from '../../utils';
import { CreatePaginationSchema } from '../pagination.type';

export const ListProjectSchema = v.object({
	...v.omit(
		CreatePaginationSchema(['interactions', 'createdAt'], {
			pageSize: 10,
			order: 'desc',
		}),
		['search'],
	).entries,
	...v.object({
		creatorId: v.optional(vStringInt),
		finished: v.optional(vStringBoolean),
	}).entries,
});

export type TListProject = v.InferOutput<typeof ListProjectSchema>;

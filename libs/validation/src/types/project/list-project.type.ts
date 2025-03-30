import { ProjectStatus } from '@unaplauso/database';
import { vQueryArray } from '@unaplauso/validation/utils/v-query-array';
import * as v from 'valibot';
import { vStringInt } from '../../utils';
import { CreatePaginationSchema } from '../pagination.type';

export const ListProjectSchema = v.strictObject({
	...v.omit(
		CreatePaginationSchema(['interactions', 'donations', 'createdAt'], {
			pageSize: 10,
			order: 'desc',
		}),
		['search'],
	).entries,
	...v.object({
		creatorId: v.optional(vStringInt),
		topicIds: v.optional(vQueryArray(vStringInt)),
		status: v.optional(v.enum(ProjectStatus)),
	}).entries,
});

export type TListProject = v.InferOutput<typeof ListProjectSchema>;

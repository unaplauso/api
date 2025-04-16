import * as v from 'valibot';
import { vQueryArray, vStringInt } from '../../utils';
import { CreatePaginationSchema } from '../pagination.type';

export const ListCreatorSchema = v.strictObject({
	...CreatePaginationSchema(
		['lastDayDonations', 'donations', 'interactions', 'createdAt'],
		{
			pageSize: 10,
			order: 'desc',
		},
	).entries,
	...v.object({
		topicIds: v.optional(vQueryArray(vStringInt)),
	}).entries,
});

export type ListCreator = v.InferOutput<typeof ListCreatorSchema>;

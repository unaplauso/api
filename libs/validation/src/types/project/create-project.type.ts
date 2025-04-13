import { Project } from '@unaplauso/database';
import { vStringFloat } from '@unaplauso/validation/utils';
import Big from 'big.js';
import dayjs from 'dayjs';
import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';

export const CreateProjectSchema = v.pipe(
	v.omit(
		v.strictObject({
			...createInsertSchema(Project, {
				title: (schema) => v.pipe(schema, v.trim()),
				deadline: v.optional(
					v.pipe(
						v.string(),
						v.isoTimestamp(),
						v.check((x) => dayjs().isBefore(x)),
					),
				),
				quotation: v.optional(vStringFloat),
				goal: v.optional(vStringFloat),
			}).entries,
			topicIds: v.optional(v.array(v.number()), []),
		}),
		['createdAt', 'creatorId', 'id', 'isCanceled', 'thumbnailFileId'],
	),
	v.check((x) => !x.goal || !x.quotation || Big(x.goal).gte(x.quotation)),
);

export type CreateProject = v.InferOutput<typeof CreateProjectSchema>;

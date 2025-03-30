import { Project } from '@unaplauso/database';
import { vStringFloat } from '@unaplauso/validation/utils';
import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';

export const CreateProjectSchema = v.omit(
	v.strictObject({
		...createInsertSchema(Project, {
			title: (schema) => v.pipe(schema, v.trim()),
			deadline: (schema) => v.optional(schema),
			quotation: v.optional(vStringFloat),
			goal: v.optional(vStringFloat),
		}).entries,
		topicIds: v.optional(v.array(v.number())),
	}),
	['createdAt', 'creatorId', 'id', 'isCanceled', 'thumbnailFileId'],
);

export type TCreateProject = v.InferOutput<typeof CreateProjectSchema>;

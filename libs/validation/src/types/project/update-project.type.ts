import * as v from 'valibot';
import { CreateProjectSchema } from './create-project.type';

export const UpdateProjectSchema = v.pipe(
	v.partial(
		v.omit(
			v.strictObject({
				...CreateProjectSchema.entries,
				isCanceled: v.optional(v.boolean()),
				addTopicIds: v.optional(
					v.pipe(v.array(v.number()), v.maxLength(10)),
					[],
				),
				removeTopicIds: v.optional(v.array(v.number()), []),
			}),
			['topicIds'],
		),
	),
	v.check((x) => Boolean(Object.keys(x).length)),
);

export type UpdateProject = v.InferOutput<typeof UpdateProjectSchema>;

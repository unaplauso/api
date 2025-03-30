import { ReportCreator } from '@unaplauso/database';
import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';

export const CreateReportCreatorSchema = v.pipe(
	v.omit(createInsertSchema(ReportCreator), ['userId', 'creatorId']),
	v.check((x) => Boolean(x.reason ?? x.message)),
);

export type TCreateReportCreator = v.InferOutput<
	typeof CreateReportCreatorSchema
>;

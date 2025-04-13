import { ReportProject } from '@unaplauso/database';
import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';

export const CreateReportProjectSchema = v.pipe(
	v.omit(createInsertSchema(ReportProject), ['userId', 'projectId']),
	v.check((x) => Boolean(x.reason ?? x.message)),
);

export type CreateReportProject = v.InferOutput<
	typeof CreateReportProjectSchema
>;

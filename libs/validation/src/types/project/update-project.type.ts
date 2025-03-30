import { Project } from '@unaplauso/database';
import { createInsertSchema } from 'drizzle-valibot';
import type * as v from 'valibot';

export const UpdateProjectSchema = createInsertSchema(Project);

export type TUpdateProject = v.InferOutput<typeof UpdateProjectSchema>;

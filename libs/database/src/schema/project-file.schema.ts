import { integer, pgTable, uuid } from 'drizzle-orm/pg-core';
import { File } from './file.schema';
import { Project } from './project.schema';

export const ProjectFile = pgTable('project_file', {
	fileId: uuid()
		.notNull()
		.primaryKey()
		.references(() => File.id, {
			onDelete: 'cascade',
		}),
	projectId: integer()
		.notNull()
		.references(() => Project.id, { onDelete: 'cascade' }),
});

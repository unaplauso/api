import { integer, pgTable, uuid } from 'drizzle-orm/pg-core';
import { FileTable } from './file.schema';
import { ProjectTable } from './project.schema';

export const ProjectFileTable = pgTable('project_file', {
	fileId: uuid()
		.notNull()
		.primaryKey()
		.references(() => FileTable.id, {
			onDelete: 'cascade',
		}),
	projectId: integer()
		.notNull()
		.references(() => ProjectTable.id, { onDelete: 'cascade' }),
});

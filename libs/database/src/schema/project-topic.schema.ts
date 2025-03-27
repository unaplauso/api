import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { ProjectTable } from './project.schema';
import { TopicTable } from './topic.schema';

export const ProjectTopicTable = pgTable(
	'project_topic',
	{
		projectId: integer()
			.notNull()
			.references(() => ProjectTable.id, { onDelete: 'cascade' }),
		topicId: integer()
			.notNull()
			.references(() => TopicTable.id, { onDelete: 'cascade' }),
	},
	(table) => [primaryKey({ columns: [table.projectId, table.topicId] })],
);

import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { Project } from './project.schema';
import { Topic } from './topic.schema';

export const ProjectTopic = pgTable(
	'project_topic',
	{
		projectId: integer()
			.notNull()
			.references(() => Project.id, { onDelete: 'cascade' }),
		topicId: integer()
			.notNull()
			.references(() => Topic.id, { onDelete: 'cascade' }),
	},
	(table) => [primaryKey({ columns: [table.projectId, table.topicId] })],
);

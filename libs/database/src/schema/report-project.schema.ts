import { type SQL, isNotNull, or } from 'drizzle-orm';
import {
	check,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	varchar,
} from 'drizzle-orm/pg-core';
import { Project } from './project.schema';
import { User } from './user.schema';

export enum ReportProjectReason {
	SPAM = 'spam',
	FRAUD = 'fraud',
	TOS_DISRESPECT = 'tos_disrespect',
	STOLEN_CONTENT = 'stolen_content',
	MISLEADING_INFORMATION = 'misleading_information',
	INTELLECTUAL_PROPERTY_VIOLATION = 'intellectual_property_violation',
	ILLEGAL_ACTIVITY = 'illegal_activity',
	HARASSMENT = 'harassment',
	DISCRIMINATION = 'discrimination',
	INAPPROPRIATE_CONTENT = 'inappropriate_content',
	ABUSIVE_BEHAVIOR = 'abusive_behavior',
}

export const ReportProjectReasonEnum = pgEnum(
	'report_project_reason',
	Object.values(ReportProjectReason) as [ReportProjectReason],
);

export const ReportProject = pgTable(
	'report_project',
	{
		userId: integer()
			.notNull()
			.references(() => User.id, { onDelete: 'cascade' }),
		projectId: integer()
			.notNull()
			.references(() => Project.id, { onDelete: 'cascade' }),
		reason: ReportProjectReasonEnum(),
		message: varchar({ length: 500 }),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.projectId] }),
		check(
			'reason_or_message_check',
			or(isNotNull(table.reason), isNotNull(table.message)) as SQL,
		),
	],
);

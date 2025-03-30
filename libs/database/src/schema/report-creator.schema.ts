import { type SQL, isNotNull, or } from 'drizzle-orm';
import {
	check,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	varchar,
} from 'drizzle-orm/pg-core';
import { User } from './user.schema';

export enum ReportCreatorReason {
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

export const ReportCreatorReasonEnum = pgEnum(
	'report_creator_reason',
	Object.values(ReportCreatorReason) as [ReportCreatorReason],
);

export const ReportCreator = pgTable(
	'report_creator',
	{
		userId: integer()
			.notNull()
			.references(() => User.id, { onDelete: 'cascade' }),
		creatorId: integer()
			.notNull()
			.references(() => User.id, { onDelete: 'cascade' }),
		reason: ReportCreatorReasonEnum(),
		message: varchar({ length: 500 }),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.creatorId] }),
		check(
			'reason_or_message_check',
			or(isNotNull(table.reason), isNotNull(table.message)) as SQL,
		),
	],
);

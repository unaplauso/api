import { type SQL, count, eq, gte, isNotNull, or, sql, sum } from 'drizzle-orm';
import { pgView } from 'drizzle-orm/pg-core';
import { ProfilePicFileTable, ProjectThumbnailFileTable } from '../aliases';
import {
	caseWhenNull,
	coalesce,
	emptiableJsonAgg,
	jsonBuildObject,
	sqlNow,
} from '../functions';
import { DonationTable } from './donation.schema';
import { ProjectDonationTable } from './project-donation.schema';
import { ProjectInteractionTable } from './project-interaction.schema';
import { ProjectTopicTable } from './project-topic.schema';
import { ProjectTable } from './project.schema';
import { TopicTable } from './topic.schema';
import { UserTable } from './user.schema';

export const TopProjectView = pgView('top_project').as((qb) =>
	qb
		.select({
			id: ProjectTable.id,
			title: ProjectTable.title,
			createdAt: ProjectTable.createdAt,
			deadline: ProjectTable.deadline,
			goal: ProjectTable.goal,
			donations: coalesce(sum(DonationTable.amount), sql`0`).as('donations'),
			interactions: coalesce(count(ProjectInteractionTable.id), sql`0`).as(
				'interactions',
			),
			finished: coalesce<boolean>(
				or(
					gte(ProjectTable.goal, sum(DonationTable.amount)),
					gte(ProjectTable.deadline, sqlNow),
				) as SQL<boolean>,
				sql`false`,
			).as('finished'),
			creatorId: sql`${UserTable.id}`.as('creator_id'),
			creator: jsonBuildObject({
				id: UserTable.id,
				username: UserTable.username,
				displayName: UserTable.displayName,
				profilePic: caseWhenNull(
					UserTable.profilePicFileId,
					jsonBuildObject({
						id: ProfilePicFileTable.id,
						bucket: ProfilePicFileTable.bucket,
						isNsfw: ProfilePicFileTable.isNsfw,
					}),
				),
			}).as('creator'),
			thumbnail: caseWhenNull(
				ProjectTable.thumbnailFileId,
				jsonBuildObject({
					id: ProjectThumbnailFileTable.id,
					bucket: ProjectThumbnailFileTable.bucket,
					isNsfw: ProjectThumbnailFileTable.isNsfw,
				}),
			).as('thumbnail'),
			topics: emptiableJsonAgg(
				jsonBuildObject({ id: TopicTable.id, name: TopicTable.name }),
				isNotNull(TopicTable.id),
			).as('topics'),
		})
		.from(ProjectTable)
		.leftJoin(
			ProjectThumbnailFileTable,
			eq(ProjectThumbnailFileTable.id, ProjectTable.thumbnailFileId),
		)
		.leftJoin(
			ProjectTopicTable,
			eq(ProjectTopicTable.projectId, ProjectTable.id),
		)
		.leftJoin(TopicTable, eq(TopicTable.id, ProjectTopicTable.topicId))
		.innerJoin(UserTable, eq(UserTable.id, ProjectTable.creatorId))
		.leftJoin(
			ProfilePicFileTable,
			eq(ProfilePicFileTable.id, UserTable.profilePicFileId),
		)
		.leftJoin(
			ProjectDonationTable,
			eq(ProjectDonationTable.projectId, ProjectTable.id),
		)
		.leftJoin(
			DonationTable,
			eq(DonationTable.id, ProjectDonationTable.donationId),
		)
		.leftJoin(
			ProjectInteractionTable,
			eq(ProjectInteractionTable.projectId, ProjectTable.id),
		)
		.groupBy(
			ProjectTable.id,
			UserTable.id,
			ProfilePicFileTable.id,
			ProjectThumbnailFileTable.id,
		),
);

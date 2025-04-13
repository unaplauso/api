import { eq, gte, lte, sql, sum } from 'drizzle-orm';
import { pgView } from 'drizzle-orm/pg-core';
import {
	arrayAgg,
	caseWhenNull,
	coalesce,
	jsonAgg,
	jsonBuildObject,
	sqlCase,
	sqlFalse,
	sqlJsonArray,
	sqlNow,
	sqlSmallintArray,
	sqlStr0,
	sqlTrue,
	whenThen,
} from '../functions';
import { ProfilePicFile, ProjectThumbnailFile } from '../helpers/aliases';
import { countWhereSq } from '../helpers/subqueries';
import { Donation } from './donation.schema';
import { FavoriteProject } from './favorite-project.schema';
import { File } from './file.schema';
import { ProjectDonation } from './project-donation.schema';
import { ProjectFile } from './project-file.schema';
import { ProjectInteraction } from './project-interaction.schema';
import { ProjectTopic } from './project-topic.schema';
import { Project, ProjectStatus } from './project.schema';
import { Topic } from './topic.schema';
import { UserIntegration } from './user-integration.schema';
import { User } from './user.schema';

export const ProjectTop = pgView('project_top').as((qb) => {
	const ProjectTopicCte = qb.$with('project_topic_cte').as((sqb) =>
		sqb
			.select({
				projectId: ProjectTopic.projectId,
				topics: jsonAgg(jsonBuildObject({ id: Topic.id, name: Topic.name })).as(
					'topics',
				),
				topicIds: arrayAgg(Topic.id).as('topic_ids'),
			})
			.from(ProjectTopic)
			.innerJoin(Topic, eq(Topic.id, ProjectTopic.topicId))
			.groupBy(ProjectTopic.projectId),
	);

	const ProjectFileCte = qb.$with('project_file_cte').as((sqb) =>
		sqb
			.select({
				projectId: ProjectFile.projectId,
				files: jsonAgg(
					jsonBuildObject({ id: File.id, isNsfw: File.isNsfw }),
				).as('files'),
				fileIds: arrayAgg(File.id).as('file_ids'),
			})
			.from(ProjectFile)
			.innerJoin(File, eq(File.id, ProjectFile.fileId))
			.groupBy(ProjectFile.projectId),
	);

	const ProjectDonationCte = qb.$with('project_donation_cte').as((sqb) =>
		sqb
			.select({
				projectId: ProjectDonation.projectId,
				amount: sum(Donation.amount).as('amount'),
				value: sum(Donation.value).as('value'),
			})
			.from(ProjectDonation)
			.innerJoin(Donation, eq(Donation.id, ProjectDonation.projectId))
			.groupBy(ProjectDonation.projectId),
	);

	return qb
		.with(ProjectTopicCte, ProjectFileCte, ProjectDonationCte)
		.select({
			id: Project.id,
			title: Project.title,
			description: Project.description,
			createdAt: Project.createdAt,
			deadline: Project.deadline,
			thumbnail: caseWhenNull(
				Project.thumbnailFileId,
				jsonBuildObject({
					id: ProjectThumbnailFile.id,
					bucket: ProjectThumbnailFile.bucket,
					isNsfw: ProjectThumbnailFile.isNsfw,
				}),
			).as('thumbnail'),
			status: sqlCase(
				ProjectStatus.OPEN,
				whenThen(eq(Project.isCanceled, true), ProjectStatus.CANCELED),
				whenThen(
					gte(ProjectDonationCte.amount, Project.goal),
					ProjectStatus.COMPLETED,
				),
				whenThen(lte(Project.deadline, sqlNow), ProjectStatus.FAILED),
			).as('status'),
			goal: Project.goal,
			quotation: Project.quotation,
			donationsAmount: coalesce(ProjectDonationCte.amount, sqlStr0).as(
				'donations_amount',
			),
			donationsValue: coalesce(ProjectDonationCte.value, sqlStr0).as(
				'donations_value',
			),
			favorites: countWhereSq(
				FavoriteProject,
				eq(FavoriteProject.projectId, Project.id),
			).as('favorites'),
			creatorId: sql<number>`${User.id}`.as('creator_id'),
			creator: jsonBuildObject({
				id: User.id,
				username: User.username,
				displayName: User.displayName,
				profilePic: caseWhenNull(
					User.profilePicFileId,
					jsonBuildObject({
						id: ProfilePicFile.id,
						bucket: ProfilePicFile.bucket,
						isNsfw: ProfilePicFile.isNsfw,
					}),
				),
			}).as('creator'),
			hasMercadoPago: coalesce(
				caseWhenNull(UserIntegration.mercadoPagoRefreshToken, sqlTrue),
				sqlFalse,
			).as('has_mercado_pago'),
			topics: coalesce(ProjectTopicCte.topics, sqlJsonArray).as('topics'),
			topicIds: coalesce(ProjectTopicCte.topicIds, sqlSmallintArray).as(
				'topic_ids',
			),
			files: coalesce(ProjectFileCte.files, sqlJsonArray).as('files'),
			interactions: countWhereSq(
				ProjectInteraction,
				eq(ProjectInteraction.projectId, Project.id),
			).as('interactions'),
		})
		.from(Project)
		.leftJoin(
			ProjectThumbnailFile,
			eq(ProjectThumbnailFile.id, Project.thumbnailFileId),
		)
		.innerJoin(User, eq(User.id, Project.creatorId))
		.innerJoin(UserIntegration, eq(UserIntegration.id, Project.creatorId))
		.leftJoin(ProfilePicFile, eq(ProfilePicFile.id, User.profilePicFileId))
		.leftJoin(ProjectTopicCte, eq(ProjectTopicCte.projectId, Project.id))
		.leftJoin(ProjectFileCte, eq(ProjectFileCte.projectId, Project.id))
		.leftJoin(ProjectDonationCte, eq(ProjectDonationCte.projectId, Project.id));
});

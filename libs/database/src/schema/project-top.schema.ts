import { eq, gte, lte, sql } from 'drizzle-orm';
import { pgView } from 'drizzle-orm/pg-core';
import {
	caseWhenNull,
	coalesce,
	jsonBuildObject,
	sqlCase,
	sqlJsonArray,
	sqlNow,
	sqlSmallintArray,
	sqlStr0,
	whenThen,
} from '../functions';
import { ProfilePicFile, ProjectThumbnailFile } from '../helpers/aliases';
import {
	BuildProjectDonationCte,
	BuildProjectFileCte,
	BuildProjectTopicCte,
} from '../helpers/ctes';
import { countWhereSq } from '../helpers/subqueries';
import { FavoriteProject } from './favorite-project.schema';
import { ProjectInteraction } from './project-interaction.schema';
import { Project, ProjectStatus } from './project.schema';
import { User } from './user.schema';

export const ProjectTop = pgView('project_top').as((qb) => {
	const [ProjectTopicCte, ProjectDonationCte, ProjectFileCte] = [
		BuildProjectTopicCte(qb),
		BuildProjectDonationCte(qb),
		BuildProjectFileCte(qb),
	];

	return qb
		.with(ProjectTopicCte, ProjectDonationCte, ProjectFileCte)
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
			creatorId: sql`${User.id}`.as('creator_id'),
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
		.leftJoin(ProfilePicFile, eq(ProfilePicFile.id, User.profilePicFileId))
		.leftJoin(ProjectDonationCte, eq(ProjectDonationCte.projectId, Project.id))
		.leftJoin(ProjectTopicCte, eq(ProjectTopicCte.projectId, Project.id))
		.leftJoin(ProjectFileCte, eq(ProjectFileCte.projectId, Project.id));
});

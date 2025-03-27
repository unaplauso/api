import { Injectable } from '@nestjs/common';
import {
	CreatorDonationTable,
	DonationTable,
	FavoriteCreatorTable,
	FavoriteProjectTable,
	ProjectDonationTable,
	ProjectTable,
	ProjectTopicTable,
	TopicTable,
	UserTable,
	UserTopicTable,
} from '@unaplauso/database';
import {
	ProfileBannerFileTable,
	ProfilePicFileTable,
	ProjectThumbnailFileTable,
} from '@unaplauso/database/aliases';

import {
	caseWhenNull,
	coalesce,
	emptiableJsonAgg,
	jsonBuildObject,
	sqlNow,
} from '@unaplauso/database/functions';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { TPagination } from '@unaplauso/validation/types';
import {
	type SQL,
	and,
	desc,
	eq,
	gte,
	isNotNull,
	or,
	sql,
	sum,
} from 'drizzle-orm';

@Injectable()
export class FavoriteService {
	constructor(@InjectDB() private readonly db: Database) {}

	async createFavoriteCreator(userId: number, creatorId: number) {
		return this.db
			.insert(FavoriteCreatorTable)
			.values({ userId, creatorId })
			.onConflictDoNothing();
	}

	async deleteFavoriteCreator(userId: number, creatorId: number) {
		return this.db
			.delete(FavoriteCreatorTable)
			.where(
				and(
					eq(FavoriteCreatorTable.userId, userId),
					eq(FavoriteCreatorTable.creatorId, creatorId),
				),
			);
	}

	listFavoriteCreatorQuery = this.db
		.select({
			id: UserTable.id,
			favoritedAt: FavoriteCreatorTable.createdAt,
			displayName: UserTable.displayName,
			username: UserTable.username,
			profilePic: caseWhenNull(
				UserTable.profilePicFileId,
				jsonBuildObject({
					id: ProfilePicFileTable.id,
					bucket: ProfilePicFileTable.bucket,
					isNsfw: ProfilePicFileTable.isNsfw,
				}),
			),
			profileBanner: caseWhenNull(
				UserTable.profileBannerFileId,
				jsonBuildObject({
					id: ProfileBannerFileTable.id,
					bucket: ProfileBannerFileTable.bucket,
					isNsfw: ProfileBannerFileTable.isNsfw,
				}),
			),
			topics: emptiableJsonAgg(
				jsonBuildObject({ id: TopicTable.id, name: TopicTable.name }),
				isNotNull(TopicTable.id),
			),
			donations: coalesce(sum(DonationTable.amount), sql`0`),
		})
		.from(FavoriteCreatorTable)
		.innerJoin(UserTable, eq(UserTable.id, FavoriteCreatorTable.creatorId))
		.leftJoin(
			ProfilePicFileTable,
			eq(ProfilePicFileTable.id, UserTable.profilePicFileId),
		)
		.leftJoin(
			ProfileBannerFileTable,
			eq(ProfileBannerFileTable.id, UserTable.profileBannerFileId),
		)
		.leftJoin(UserTopicTable, eq(UserTopicTable.userId, UserTable.id))
		.leftJoin(TopicTable, eq(TopicTable.id, UserTopicTable.topicId))
		.leftJoin(
			CreatorDonationTable,
			eq(CreatorDonationTable.creatorId, UserTable.id),
		)
		.leftJoin(
			DonationTable,
			eq(DonationTable.id, CreatorDonationTable.donationId),
		)
		.where(eq(FavoriteCreatorTable.userId, sql.placeholder('userId')))
		.groupBy(
			UserTable.id,
			FavoriteCreatorTable.createdAt,
			ProfilePicFileTable.id,
			ProfileBannerFileTable.id,
		)
		.orderBy(desc(FavoriteCreatorTable.createdAt))
		.limit(sql.placeholder('limit'))
		.offset(sql.placeholder('offset'))
		.prepare('list_favorite_creator_query');

	async listFavoriteCreator(
		userId: number,
		dto: Omit<TPagination, 'order' | 'search'>,
	) {
		return this.listFavoriteCreatorQuery.execute({
			userId,
			limit: dto.pageSize,
			offset: (dto.page - 1) * dto.pageSize,
		});
	}

	async createFavoriteProject(userId: number, projectId: number) {
		return this.db
			.insert(FavoriteProjectTable)
			.values({ userId, projectId })
			.onConflictDoNothing();
	}

	async deleteFavoriteProject(userId: number, projectId: number) {
		return this.db
			.delete(FavoriteProjectTable)
			.where(
				and(
					eq(FavoriteProjectTable.userId, userId),
					eq(FavoriteProjectTable.projectId, projectId),
				),
			);
	}

	listFavoriteProjectQuery = this.db
		.select({
			id: ProjectTable.id,
			title: ProjectTable.title,
			favoritedAt: FavoriteProjectTable.createdAt,
			createdAt: ProjectTable.createdAt,
			deadline: ProjectTable.deadline,
			goal: ProjectTable.goal,
			donations: coalesce(sum(DonationTable.amount), sql`0`),
			finished: coalesce<boolean>(
				or(
					gte(ProjectTable.goal, sum(DonationTable.amount)),
					gte(ProjectTable.deadline, sqlNow),
				) as SQL<boolean>,
				sql`false`,
			),
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
			}),
			thumbnail: caseWhenNull(
				ProjectTable.thumbnailFileId,
				jsonBuildObject({
					id: ProjectThumbnailFileTable.id,
					bucket: ProjectThumbnailFileTable.bucket,
					isNsfw: ProjectThumbnailFileTable.isNsfw,
				}),
			),
			topics: emptiableJsonAgg(
				jsonBuildObject({ id: TopicTable.id, name: TopicTable.name }),
				isNotNull(TopicTable.id),
			),
		})
		.from(FavoriteProjectTable)
		.innerJoin(
			ProjectTable,
			eq(ProjectTable.id, FavoriteProjectTable.projectId),
		)
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
		.where(eq(FavoriteProjectTable.userId, sql.placeholder('userId')))
		.groupBy(
			ProjectTable.id,
			FavoriteProjectTable.createdAt,
			UserTable.id,
			ProfilePicFileTable.id,
			ProjectThumbnailFileTable.id,
		)
		.orderBy(desc(FavoriteProjectTable.createdAt))
		.limit(sql.placeholder('limit'))
		.offset(sql.placeholder('offset'))
		.prepare('list_favorite_project_query');

	async listFavoriteProject(
		userId: number,
		dto: Omit<TPagination, 'order' | 'search'>,
	) {
		return this.listFavoriteProjectQuery.execute({
			userId,
			limit: dto.pageSize,
			offset: (dto.page - 1) * dto.pageSize,
		});
	}
}

import { Injectable } from '@nestjs/common';
import {
	CreatorDonation,
	Donation,
	FavoriteCreator,
	FavoriteProject,
	ProjectTop,
	Topic,
	User,
	UserTopic,
} from '@unaplauso/database';
import {
	ProfileBannerFile,
	ProfilePicFile,
} from '@unaplauso/database/helpers/aliases';

import {
	caseWhenNull,
	coalesce,
	jsonAgg,
	jsonBuildObject,
	sqlJsonArray,
} from '@unaplauso/database/functions';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { TPagination } from '@unaplauso/validation/types';
import {
	and,
	desc,
	eq,
	getViewSelectedFields,
	isNotNull,
	sql,
	sum,
} from 'drizzle-orm';

@Injectable()
export class FavoriteService {
	constructor(@InjectDB() private readonly db: Database) {}

	async createFavoriteCreator(userId: number, creatorId: number) {
		return this.db
			.insert(FavoriteCreator)
			.values({ userId, creatorId })
			.onConflictDoNothing();
	}

	async deleteFavoriteCreator(userId: number, creatorId: number) {
		return this.db
			.delete(FavoriteCreator)
			.where(
				and(
					eq(FavoriteCreator.userId, userId),
					eq(FavoriteCreator.creatorId, creatorId),
				),
			);
	}

	listFavoriteCreatorQuery = this.db
		.select({
			id: User.id,
			favoritedAt: FavoriteCreator.createdAt,
			displayName: User.displayName,
			username: User.username,
			profilePic: caseWhenNull(
				User.profilePicFileId,
				jsonBuildObject({
					id: ProfilePicFile.id,
					bucket: ProfilePicFile.bucket,
					isNsfw: ProfilePicFile.isNsfw,
				}),
			),
			profileBanner: caseWhenNull(
				User.profileBannerFileId,
				jsonBuildObject({
					id: ProfileBannerFile.id,
					bucket: ProfileBannerFile.bucket,
					isNsfw: ProfileBannerFile.isNsfw,
				}),
			),
			topics: coalesce(
				jsonAgg(
					jsonBuildObject({ id: Topic.id, name: Topic.name }),
					isNotNull(Topic.id),
				),
				sqlJsonArray,
			),
			donations: coalesce(sum(Donation.amount), sql`0`),
		})
		.from(FavoriteCreator)
		.innerJoin(User, eq(User.id, FavoriteCreator.creatorId))
		.leftJoin(ProfilePicFile, eq(ProfilePicFile.id, User.profilePicFileId))
		.leftJoin(
			ProfileBannerFile,
			eq(ProfileBannerFile.id, User.profileBannerFileId),
		)
		.leftJoin(UserTopic, eq(UserTopic.userId, User.id))
		.leftJoin(Topic, eq(Topic.id, UserTopic.topicId))
		.leftJoin(CreatorDonation, eq(CreatorDonation.creatorId, User.id))
		.leftJoin(Donation, eq(Donation.id, CreatorDonation.donationId))
		.where(eq(FavoriteCreator.userId, sql.placeholder('userId')))
		.groupBy(
			User.id,
			FavoriteCreator.createdAt,
			ProfilePicFile.id,
			ProfileBannerFile.id,
		)
		.orderBy(desc(FavoriteCreator.createdAt))
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
			.insert(FavoriteProject)
			.values({ userId, projectId })
			.onConflictDoNothing();
	}

	async deleteFavoriteProject(userId: number, projectId: number) {
		return this.db
			.delete(FavoriteProject)
			.where(
				and(
					eq(FavoriteProject.userId, userId),
					eq(FavoriteProject.projectId, projectId),
				),
			);
	}

	async listFavoriteProject(
		userId: number,
		dto: Omit<TPagination, 'order' | 'search'>,
	) {
		const {
			description,
			createdAt,
			deadline,
			quotation,
			donationsValue,
			creatorId,
			topicIds,
			files,
			interactions,
			...selection
		} = getViewSelectedFields(ProjectTop);

		return this.db
			.select({ favoritedAt: FavoriteProject.createdAt, ...selection })
			.from(FavoriteProject)
			.innerJoin(ProjectTop, eq(ProjectTop.id, FavoriteProject.projectId))
			.where(eq(FavoriteProject.userId, userId))
			.limit(dto.pageSize)
			.offset((dto.page - 1) * dto.pageSize)
			.orderBy(desc(FavoriteProject.createdAt));
	}
}

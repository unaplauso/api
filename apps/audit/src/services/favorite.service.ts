import { Injectable } from '@nestjs/common';
import {
	CreatorTop,
	FavoriteCreator,
	FavoriteProject,
	ProjectTop,
} from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { Pagination } from '@unaplauso/validation/types';
import { and, desc, eq, getViewSelectedFields } from 'drizzle-orm';

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

	async listFavoriteCreator(
		userId: number,
		dto: Omit<Pagination, 'order' | 'search'>,
	) {
		const {
			createdAt,
			description,
			customThanks,
			location,
			quotation,
			personalUrl,
			instagramUser,
			facebookUser,
			xUser,
			tiktokUser,
			githubUser,
			donationsValue,
			hasMercadoPago,
			topicIds,
			interactions,
			...selection
		} = getViewSelectedFields(CreatorTop);

		return this.db
			.select({ favoritedAt: FavoriteCreator.createdAt, ...selection })
			.from(FavoriteCreator)
			.innerJoin(CreatorTop, eq(CreatorTop.id, FavoriteCreator.creatorId))
			.where(eq(FavoriteCreator.userId, userId))
			.limit(dto.pageSize)
			.offset((dto.page - 1) * dto.pageSize)
			.orderBy(desc(FavoriteCreator.createdAt));
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
		dto: Omit<Pagination, 'order' | 'search'>,
	) {
		const {
			description,
			createdAt,
			deadline,
			quotation,
			donationsValue,
			creatorId,
			hasMercadoPago,
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

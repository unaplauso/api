import { Injectable } from '@nestjs/common';
import {
	CreatorTop,
	CreatorTopMv,
	User,
	UserDetail,
} from '@unaplauso/database';
import {
	coalesce,
	sqlArray,
	sqlEmptyStr,
	wordSimilarity,
} from '@unaplauso/database/functions';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { ListCreator } from '@unaplauso/validation/types';
import {
	and,
	arrayOverlaps,
	asc,
	desc,
	eq,
	getViewSelectedFields,
	gte,
	sql,
} from 'drizzle-orm';

@Injectable()
export class CreatorService {
	constructor(@InjectDB() private readonly db: Database) {}

	async readCreator(idOrUsername: string | number) {
		const {
			createdAt,
			customThanks,
			donationsValue,
			lastDayDonationsAmount,
			lastDayDonationsValue,
			topicIds,
			interactions,
			...selection
		} = getViewSelectedFields(CreatorTop);

		return (
			await this.db
				.select(selection)
				.from(CreatorTop)
				.where(
					typeof idOrUsername === 'number'
						? eq(CreatorTop.id, idOrUsername)
						: eq(CreatorTop.username, idOrUsername),
				)
		).at(0);
	}

	async readCreatorCustomThanks(idOrUsername: string | number) {
		return (
			await this.db
				.select({ customThanks: UserDetail.customThanks })
				.from(UserDetail)
				.innerJoin(User, eq(User.id, UserDetail.id))
				.where(
					typeof idOrUsername === 'number'
						? eq(User.id, idOrUsername)
						: eq(User.username, idOrUsername),
				)
		).at(0)?.customThanks;
	}
	async listCreator(dto: ListCreator) {
		const {
			createdAt,
			donationsValue,
			lastDayDonationsValue,
			topicIds,
			interactions,
			...selection
		} = getViewSelectedFields(CreatorTopMv);

		const similarityTrait = sql<string>`lower(${CreatorTopMv.username} || '|' || ${coalesce(CreatorTopMv.displayName, sqlEmptyStr)})`;

		return this.db
			.select(selection)
			.from(CreatorTopMv)
			.where(
				and(
					dto.search
						? gte(
								wordSimilarity(similarityTrait, dto.search),
								Math.min(Math.exp(dto.search.length * 0.1) * 0.2, 0.5),
							)
						: undefined,
					dto.topicIds?.length
						? arrayOverlaps(
								CreatorTopMv.topicIds,
								sqlArray(dto.topicIds, 'smallint'),
							)
						: undefined,
				),
			)
			.orderBy(
				dto.search
					? desc(wordSimilarity(similarityTrait, dto.search))
					: (dto.order === 'asc' ? asc : desc)(
							dto.orderBy === 'createdAt'
								? CreatorTopMv.createdAt
								: dto.orderBy === 'interactions'
									? CreatorTopMv.interactions
									: dto.orderBy === 'donations'
										? CreatorTopMv.donationsValue
										: CreatorTopMv.lastDayDonationsValue,
						),
				desc(
					dto.orderBy === 'interactions'
						? CreatorTopMv.createdAt
						: CreatorTopMv.interactions,
				),
			)
			.limit(dto.pageSize)
			.offset((dto.page - 1) * dto.pageSize);
	}
}

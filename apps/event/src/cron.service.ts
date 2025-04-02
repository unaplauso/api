import type { Cache } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { days } from '@nestjs/throttler';
import { InjectCache } from '@unaplauso/common/decorators';
import {
	CreatorInteraction,
	CreatorTopMat,
	ProjectInteraction,
	ProjectStatus,
	ProjectTop,
} from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import dayjs from 'dayjs';
import { desc, eq, getViewSelectedFields, lt } from 'drizzle-orm';

@Injectable()
export class CronService {
	constructor(
		@InjectDB() private readonly db: Database,
		@InjectCache() private readonly cache: Cache,
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_9PM)
	async refreshTopCreator() {
		await this.db.refreshMaterializedView(CreatorTopMat);
		const top = await this.db.select().from(CreatorTopMat).limit(10);
		return this.cache.set('creator_top_10', top, days(1));
	}

	@Cron(CronExpression.EVERY_10_MINUTES)
	async refreshTopProject() {
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

		const data = await this.db
			.select(selection)
			.from(ProjectTop)
			.where(eq(ProjectTop.status, ProjectStatus.OPEN))
			.orderBy(desc(ProjectTop.interactions))
			.limit(10);

		return this.cache.set('top_project', data);
	}

	@Cron(CronExpression.EVERY_4_HOURS)
	async deleteInteractions() {
		const date = dayjs().subtract(1, 'week').toDate();
		return Promise.all([
			this.db
				.delete(ProjectInteraction)
				.where(lt(ProjectInteraction.createdAt, date)),
			this.db
				.delete(CreatorInteraction)
				.where(lt(CreatorInteraction.createdAt, date)),
		]);
	}
}

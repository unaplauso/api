import type { Cache } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { days } from '@nestjs/throttler';
import { InjectCache } from '@unaplauso/common/decorators';
import {
	CreatorInteractionTable,
	ProjectInteractionTable,
	TopCreatorView,
	TopProjectView,
} from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import dayjs from 'dayjs';
import { desc, getViewSelectedFields, lt } from 'drizzle-orm';

@Injectable()
export class CronService {
	constructor(
		@InjectDB() private readonly db: Database,
		@InjectCache() private readonly cache: Cache,
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_9PM)
	async refreshTopCreatorView() {
		await this.db.refreshMaterializedView(TopCreatorView);
		const top = this.db.select().from(TopCreatorView).limit(10);
		return this.cache.set('top_creator', top, days(1));
	}

	@Cron(CronExpression.EVERY_10_MINUTES)
	async refreshTopProjectCache() {
		const { creatorId, interactions, createdAt, ...selection } =
			getViewSelectedFields(TopProjectView);

		const data = await this.db
			.select(selection)
			.from(TopProjectView)
			.orderBy(desc(TopProjectView.interactions))
			.limit(10);

		return this.cache.set('top_project', data);
	}

	@Cron(CronExpression.EVERY_4_HOURS)
	async deleteInteractions() {
		const date = dayjs().subtract(1, 'week').toDate();
		return Promise.all([
			this.db
				.delete(ProjectInteractionTable)
				.where(lt(ProjectInteractionTable.createdAt, date)),
			this.db
				.delete(CreatorInteractionTable)
				.where(lt(CreatorInteractionTable.createdAt, date)),
		]);
	}
}

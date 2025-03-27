import { Injectable } from '@nestjs/common';
import { ReportCreatorTable, ReportProjectTable } from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type {
	UserToCreatorAction,
	UserToProjectAction,
} from '@unaplauso/validation';
import type {
	TCreateReportCreator,
	TCreateReportProject,
} from '@unaplauso/validation/types';

@Injectable()
export class ReportService {
	constructor(@InjectDB() private readonly db: Database) {}

	async createReportCreator(dto: UserToCreatorAction<TCreateReportCreator>) {
		return this.db
			.insert(ReportCreatorTable)
			.values(dto)
			.onConflictDoUpdate({
				target: [ReportCreatorTable.userId, ReportCreatorTable.creatorId],
				set: { message: dto.message, reason: dto.reason },
			});
	}

	async createReportProject(dto: UserToProjectAction<TCreateReportProject>) {
		return this.db
			.insert(ReportProjectTable)
			.values(dto)
			.onConflictDoUpdate({
				target: [ReportProjectTable.userId, ReportProjectTable.projectId],
				set: { message: dto.message, reason: dto.reason },
			});
	}
}

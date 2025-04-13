import { Injectable } from '@nestjs/common';
import { ReportCreator, ReportProject } from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type {
	UserToCreatorAction,
	UserToProjectAction,
} from '@unaplauso/validation';
import type {
	CreateReportCreator,
	CreateReportProject,
} from '@unaplauso/validation/types';

@Injectable()
export class ReportService {
	constructor(@InjectDB() private readonly db: Database) {}

	async createReportCreator(dto: UserToCreatorAction<CreateReportCreator>) {
		return this.db
			.insert(ReportCreator)
			.values(dto)
			.onConflictDoUpdate({
				target: [ReportCreator.userId, ReportCreator.creatorId],
				set: { message: dto.message, reason: dto.reason },
			});
	}

	async createReportProject(dto: UserToProjectAction<CreateReportProject>) {
		return this.db
			.insert(ReportProject)
			.values(dto)
			.onConflictDoUpdate({
				target: [ReportProject.userId, ReportProject.projectId],
				set: { message: dto.message, reason: dto.reason },
			});
	}
}

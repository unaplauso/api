import { Injectable } from '@nestjs/common';
import { TopProjectView } from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { TListProject } from '@unaplauso/validation/types';
import { and, asc, desc, eq, getViewSelectedFields } from 'drizzle-orm';

@Injectable()
export class ProjectService {
	constructor(@InjectDB() private readonly db: Database) {}

	async listProject(dto: TListProject) {
		const { creatorId, interactions, createdAt, ...selection } =
			getViewSelectedFields(TopProjectView);

		return this.db
			.select(selection)
			.from(TopProjectView)
			.where(
				and(
					dto.creatorId
						? eq(TopProjectView.creatorId, dto.creatorId)
						: undefined,
					dto.finished !== undefined
						? eq(TopProjectView.finished, dto.finished)
						: undefined,
				),
			)
			.orderBy(
				(dto.order === 'asc' ? asc : desc)(
					dto.orderBy === 'createdAt'
						? TopProjectView.createdAt
						: TopProjectView.interactions,
				),
			)
			.limit(dto.pageSize)
			.offset((dto.page - 1) * dto.pageSize);
	}
}

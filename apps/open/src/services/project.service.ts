import { Injectable } from '@nestjs/common';
import { ProjectTop } from '@unaplauso/database';
import { sqlArray } from '@unaplauso/database/functions/sql-array';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { TListProject } from '@unaplauso/validation/types';
import {
	and,
	arrayOverlaps,
	asc,
	desc,
	eq,
	getViewSelectedFields,
} from 'drizzle-orm';

@Injectable()
export class ProjectService {
	constructor(@InjectDB() private readonly db: Database) {}

	async readProject(id: number) {
		const {
			createdAt,
			donationsValue,
			creatorId,
			topicIds,
			interactions,
			...selection
		} = getViewSelectedFields(ProjectTop);

		return (
			await this.db
				.select(selection)
				.from(ProjectTop)
				.where(eq(ProjectTop.id, id))
		).at(0);
	}

	async listProject(dto: TListProject) {
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
			.select(selection)
			.from(ProjectTop)
			.where(
				and(
					dto.creatorId ? eq(ProjectTop.creatorId, dto.creatorId) : undefined,
					dto.status ? eq(ProjectTop.status, dto.status) : undefined,
					dto.topicIds?.length
						? arrayOverlaps(
								ProjectTop.topicIds,
								sqlArray(dto.topicIds, 'smallint'),
							)
						: undefined,
				),
			)
			.orderBy(
				(dto.order === 'asc' ? asc : desc)(
					dto.orderBy === 'createdAt'
						? ProjectTop.createdAt
						: dto.orderBy === 'donations'
							? ProjectTop.interactions
							: ProjectTop.donationsValue,
				),
			)
			.limit(dto.pageSize)
			.offset((dto.page - 1) * dto.pageSize);
	}
}

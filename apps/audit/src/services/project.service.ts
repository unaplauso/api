import { Injectable } from '@nestjs/common';
import { ProjectTable } from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class ProjectService {
	constructor(@InjectDB() private readonly db: Database) {}

	async deleteProject(projectId: number, userId: number) {
		return this.db
			.delete(ProjectTable)
			.where(
				and(eq(ProjectTable.id, projectId), eq(ProjectTable.creatorId, userId)),
			);
	}
}

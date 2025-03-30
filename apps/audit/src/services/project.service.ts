import { Injectable } from '@nestjs/common';
import { Project, ProjectTopic } from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { UserAction } from '@unaplauso/validation';
import type {
	TCreateProject,
	TUpdateProject,
} from '@unaplauso/validation/types';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class ProjectService {
	constructor(@InjectDB() private readonly db: Database) {}

	// TODO: files
	// FIXME: dates
	// with insert?
	async createProject({
		topicIds,
		userId: creatorId,
		...dto
	}: UserAction<TCreateProject>) {
		console.log({ dto, topicIds });
		return this.db.transaction(async (tx) => {
			const { projectId } = (
				await tx
					.insert(Project)
					.values({ ...dto, creatorId })
					.returning({ projectId: Project.id })
			)[0];

			if (topicIds)
				await tx.insert(ProjectTopic).values(
					topicIds.map((topicId) => ({
						topicId,
						projectId,
					})),
				);

			return projectId;
		});
	}

	// TODO: con delete project files, categories, etc
	async updateProject(dto: UserAction<TUpdateProject>) {
		return 'dx';
	}

	async deleteProject(projectId: number, userId: number) {
		return this.db
			.delete(Project)
			.where(and(eq(Project.id, projectId), eq(Project.creatorId, userId)));
	}
}

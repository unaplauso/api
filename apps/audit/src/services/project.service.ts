import { ForbiddenException, Injectable } from '@nestjs/common';
import { Project, ProjectTopic } from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { UserAction, UserToProjectAction } from '@unaplauso/validation';
import type { CreateProject, UpdateProject } from '@unaplauso/validation/types';
import { and, eq, inArray } from 'drizzle-orm';

@Injectable()
export class ProjectService {
	constructor(@InjectDB() private readonly db: Database) {}

	async createProject({
		topicIds,
		userId: creatorId,
		...dto
	}: UserAction<CreateProject>) {
		return this.db.transaction(async (tx) => {
			const { projectId } = (
				await tx
					.insert(Project)
					.values({ ...dto, creatorId })
					.returning({ projectId: Project.id })
			)[0];

			if (topicIds.length)
				await tx.insert(ProjectTopic).values(
					topicIds.map((topicId) => ({
						topicId,
						projectId,
					})),
				);

			return projectId;
		});
	}

	async updateProject({
		projectId,
		userId: creatorId,
		addTopicIds,
		removeTopicIds,
		...dto
	}: UserToProjectAction<UpdateProject>) {
		const id = (
			await this.db
				.select({ id: Project.id })
				.from(Project)
				.where(and(eq(Project.id, projectId), eq(Project.creatorId, creatorId)))
		).at(0)?.id;

		if (!id) throw new ForbiddenException();

		return this.db.transaction(async (tx) =>
			Promise.all([
				Object.keys(dto).length &&
					tx.update(Project).set(dto).where(eq(Project.id, id)),
				removeTopicIds?.length &&
					tx
						.delete(ProjectTopic)
						.where(
							and(
								inArray(ProjectTopic.topicId, removeTopicIds),
								eq(ProjectTopic.projectId, id),
							),
						),
				addTopicIds?.length &&
					tx
						.insert(ProjectTopic)
						.values(addTopicIds.map((t) => ({ topicId: t, projectId: id })))
						.onConflictDoNothing(),
			]),
		);
	}

	async deleteProject(projectId: number, userId: number) {
		return this.db
			.delete(Project)
			.where(and(eq(Project.id, projectId), eq(Project.creatorId, userId)));
	}
}

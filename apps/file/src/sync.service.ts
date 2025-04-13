import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { ForbiddenException, Injectable } from '@nestjs/common';
import {
	File,
	FileType,
	Project,
	ProjectFile,
	type S3Bucket,
	User,
} from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { SyncDeleteFile, SyncFile } from '@unaplauso/files';
import { and, eq, inArray } from 'drizzle-orm';
import type { QueryResult } from 'pg';

@Injectable()
export class SyncService {
	constructor(@InjectDB() private readonly db: Database) {}

	private async profilePicCallback(
		tx: Database,
		fileId: string,
		userId: number,
	) {
		return tx
			.update(User)
			.set({ profilePicFileId: fileId })
			.where(eq(User.id, userId));
	}

	private async profileBannerCallback(
		tx: Database,
		fileId: string,
		userId: number,
	) {
		return tx
			.update(User)
			.set({ profileBannerFileId: fileId })
			.where(eq(User.id, userId));
	}

	private async projectFileCallback(
		tx: Database,
		fileIds: string[],
		projectId: number,
	) {
		return tx
			.insert(ProjectFile)
			.values(fileIds.map((fileId) => ({ fileId, projectId })));
	}

	private async projectThumbnailCallback(
		tx: Database,
		fileId: string,
		projectId: number,
	) {
		return tx
			.update(Project)
			.set({ thumbnailFileId: fileId })
			.where(and(eq(Project.id, projectId)));
	}

	async execCallback(
		tx: Database,
		ids: string[],
		data: SyncFile,
	): Promise<QueryResult> {
		if (data.type === FileType.PROFILE_PIC)
			return this.profilePicCallback(tx, ids[0], data.userId);
		if (data.type === FileType.PROFILE_BANNER)
			return this.profileBannerCallback(tx, ids[0], data.userId);
		if (data.type === FileType.PROJECT_FILE)
			return this.projectFileCallback(tx, ids, data.projectId);
		if (data.type === FileType.PROJECT_THUMBNAIL)
			return this.projectThumbnailCallback(tx, ids[0], data.projectId);
		return data.type;
	}

	async getOptions(
		tx: Database,
		data: SyncFile,
	): Promise<Partial<PutObjectCommandInput & { Bucket: S3Bucket }>> {
		if (
			data.type === FileType.PROFILE_PIC ||
			data.type === FileType.PROFILE_BANNER
		)
			return {};

		if (
			data.type === FileType.PROJECT_FILE ||
			data.type === FileType.PROJECT_THUMBNAIL
		) {
			if (
				!(
					await tx
						.select({ id: Project.id })
						.from(Project)
						.where(
							and(
								eq(Project.id, data.projectId),
								eq(Project.creatorId, data.userId),
							),
						)
				).at(0)?.id
			)
				throw new ForbiddenException();

			return {};
		}

		return data.type;
	}

	async execDelete(data: SyncDeleteFile): Promise<QueryResult> {
		if (data.type === FileType.PROFILE_PIC)
			return this.db
				.update(User)
				.set({ profilePicFileId: null })
				.where(eq(User.id, data.userId));
		if (data.type === FileType.PROFILE_BANNER)
			return this.db
				.update(User)
				.set({ profileBannerFileId: null })
				.where(eq(User.id, data.userId));
		if (data.type === FileType.PROJECT_FILE) {
			return this.db.delete(File).where(
				inArray(
					File.id,
					this.db
						.select({ id: File.id })
						.from(File)
						.innerJoin(
							ProjectFile,
							and(
								eq(ProjectFile.fileId, File.id),
								eq(ProjectFile.projectId, data.projectId),
							),
						)
						.innerJoin(
							Project,
							and(
								eq(Project.id, data.projectId),
								eq(Project.creatorId, data.userId),
							),
						)
						.where(inArray(File.id, data.fileIds)),
				),
			);
		}
		if (data.type === FileType.PROJECT_THUMBNAIL)
			return this.db
				.update(Project)
				.set({ thumbnailFileId: null })
				.where(
					and(
						eq(Project.id, data.projectId),
						eq(Project.creatorId, data.userId),
					),
				);
		return data.type;
	}
}

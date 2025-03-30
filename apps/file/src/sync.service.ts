import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
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
import { eq } from 'drizzle-orm';
import type { QueryResult } from 'pg';

@Injectable()
export class SyncService {
	constructor(@InjectDB() private readonly db: Database) {}

	private async profilePicCallback(fileId: string, userId: number) {
		return this.db
			.update(User)
			.set({ profilePicFileId: fileId })
			.where(eq(User.id, userId));
	}

	private async profileBannerCallback(fileId: string, userId: number) {
		return this.db
			.update(User)
			.set({ profileBannerFileId: fileId })
			.where(eq(User.id, userId));
	}

	private async projectFileCallback(fileId: string, projectId: number) {
		return this.db.insert(ProjectFile).values({ fileId, projectId });
	}

	private async projectThumbnailCallback(fileId: string, projectId: number) {
		return this.db
			.update(Project)
			.set({ thumbnailFileId: fileId })
			.where(eq(Project.id, projectId));
	}

	async execCallback(id: string, data: SyncFile): Promise<QueryResult> {
		if (data.type === FileType.PROFILE_PIC)
			return this.profilePicCallback(id, data.userId);
		if (data.type === FileType.PROFILE_BANNER)
			return this.profileBannerCallback(id, data.userId);
		if (data.type === FileType.PROJECT_FILE)
			return this.projectFileCallback(id, data.projectId);
		if (data.type === FileType.PROJECT_THUMBNAIL)
			return this.projectThumbnailCallback(id, data.projectId);
		return data.type;
	}

	async getOptions({
		type: t,
	}: SyncFile): Promise<Partial<PutObjectCommandInput & { Bucket: S3Bucket }>> {
		if (t === FileType.PROFILE_PIC) return {};
		if (t === FileType.PROFILE_BANNER) return {};
		if (t === FileType.PROJECT_FILE) return {};
		if (t === FileType.PROJECT_THUMBNAIL) return {};
		return t;
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
		if (data.type === FileType.PROJECT_FILE)
			return this.db.delete(File).where(eq(File.id, data.fileId));
		if (data.type === FileType.PROJECT_THUMBNAIL)
			return this.db
				.update(Project)
				.set({ thumbnailFileId: null })
				.where(eq(Project.id, data.projectId));
		return data.type;
	}
}

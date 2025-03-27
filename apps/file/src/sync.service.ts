import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import {
	FileTable,
	FileType,
	ProjectFileTable,
	ProjectTable,
	type S3Bucket,
	UserTable,
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
			.update(UserTable)
			.set({ profilePicFileId: fileId })
			.where(eq(UserTable.id, userId));
	}

	private async profileBannerCallback(fileId: string, userId: number) {
		return this.db
			.update(UserTable)
			.set({ profileBannerFileId: fileId })
			.where(eq(UserTable.id, userId));
	}

	private async projectFileCallback(fileId: string, projectId: number) {
		return this.db.insert(ProjectFileTable).values({ fileId, projectId });
	}

	private async projectThumbnailCallback(fileId: string, projectId: number) {
		return this.db
			.update(ProjectTable)
			.set({ thumbnailFileId: fileId })
			.where(eq(ProjectTable.id, projectId));
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
				.update(UserTable)
				.set({ profilePicFileId: null })
				.where(eq(UserTable.id, data.userId));
		if (data.type === FileType.PROFILE_BANNER)
			return this.db
				.update(UserTable)
				.set({ profileBannerFileId: null })
				.where(eq(UserTable.id, data.userId));
		if (data.type === FileType.PROJECT_FILE)
			return this.db.delete(FileTable).where(eq(FileTable.id, data.fileId));
		if (data.type === FileType.PROJECT_THUMBNAIL)
			return this.db
				.update(ProjectTable)
				.set({ thumbnailFileId: null })
				.where(eq(ProjectTable.id, data.projectId));
		return data.type;
	}
}

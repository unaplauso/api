import type { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { InjectConfig, InjectHttp } from '@unaplauso/common/decorators';
import {
	CreatorInteraction,
	File,
	ProjectInteraction,
	type S3Bucket,
} from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { AxiosResponse } from 'axios';
import { eq } from 'drizzle-orm';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EventService {
	private readonly MODERATION_API_URL: string;
	private readonly MODERATION_API_KEY: string | undefined;

	constructor(
		@InjectHttp() private readonly http: HttpService,
		@InjectConfig() private readonly config: ConfigService,
		@InjectDB() private readonly db: Database,
	) {
		this.MODERATION_API_KEY = this.config.get('MODERATION_API_URL');
		this.MODERATION_API_URL = this.config.get(
			'MODERATION_API_URL',
			'http://127.0.0.1:8000/api/moderation',
		);
	}

	async fileUploaded(uuid: string, bucket: S3Bucket, mimetype?: string) {
		if (mimetype?.startsWith('image/')) {
			const { data } = await firstValueFrom<AxiosResponse<{ isNsfw: boolean }>>(
				this.http.get(
					`${this.MODERATION_API_URL}/image-review/${bucket}/${uuid}`,
					{
						headers: { 'x-api-key': this.MODERATION_API_KEY },
					},
				),
			);

			if (data.isNsfw)
				return this.db
					.update(File)
					.set({ isNsfw: true })
					.where(eq(File.id, uuid));
		}

		return true;
	}

	async projectRead(projectId: number) {
		return this.db.insert(ProjectInteraction).values({ projectId });
	}

	async creatorRead(creatorId: number) {
		return this.db.insert(CreatorInteraction).values({ creatorId });
	}
}

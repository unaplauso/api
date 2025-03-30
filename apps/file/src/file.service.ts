import {
	DeleteObjectCommand,
	type PutObjectCommandInput,
	S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Inject, Injectable, MisdirectedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { InjectConfig } from '@unaplauso/common/decorators';
import { File, S3Bucket } from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { SyncFile } from '@unaplauso/files';
import { IS_DEVELOPMENT } from '@unaplauso/validation';
import type { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { eq } from 'drizzle-orm';
import { SyncService } from './sync.service';

@Injectable()
export class FileService {
	private readonly s3: S3Client;

	constructor(
		@InjectConfig() private readonly config: ConfigService,
		@InjectDB() private readonly db: Database,
		@Inject(SyncService) private readonly sync: SyncService,
	) {
		this.s3 = new S3Client({
			region: this.config.get('S3_AWS_REGION', 'sa-east-1'),
			credentials: {
				accessKeyId: this.config.getOrThrow('S3_AWS_ACCESS_KEY_ID'),
				secretAccessKey: this.config.getOrThrow('S3_AWS_SECRET_ACCESS_KEY'),
			},
		});
	}

	private async uploadFileToS3(
		file: MulterFile,
		metadata: { Key: string } & Partial<PutObjectCommandInput>,
	) {
		return new Upload({
			client: this.s3,
			params: {
				Bucket: S3Bucket.PUBLIC,
				ContentType: file.mimetype,
				ContentEncoding: file.encoding,
				Body: Buffer.from(file.buffer),
				...metadata,
			},
		}).done();
	}

	private async syncToDatabase(data: SyncFile, bucket?: S3Bucket) {
		return (
			await this.db
				.insert(File)
				.values({
					type: data.type,
					mimetype: data.file.mimetype,
					bucket,
				})
				.returning({ id: File.id, bucket: File.bucket })
		)[0];
	}

	private async deleteFile(Key: string) {
		return this.db.delete(File).where(eq(File.id, Key));
	}

	async syncFile(data: SyncFile) {
		const op = await this.sync.getOptions(data);
		const file = await this.syncToDatabase(data, op.Bucket);

		try {
			await this.sync.execCallback(file.id, data);

			this.uploadFileToS3(data.file, { ...op, Key: file.id }).catch(
				console.error,
			);

			return file;
		} catch (e: unknown) {
			await this.deleteFile(file.id);
			throw new MisdirectedException(IS_DEVELOPMENT ? e : undefined);
		}
	}

	async deleteFileFromS3(file: { bucket: S3Bucket; id: string }) {
		return this.s3.send(
			new DeleteObjectCommand({ Bucket: file.bucket, Key: file.id }),
		);
	}
}

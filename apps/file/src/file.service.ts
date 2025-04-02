import {
	DeleteObjectCommand,
	type PutObjectCommandInput,
	S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { InjectConfig } from '@unaplauso/common/decorators';
import { File, S3Bucket } from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { SyncFile } from '@unaplauso/files';
import {
	InjectClient,
	type InternalService,
	Service,
} from '@unaplauso/services';
import type { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { SyncService } from './sync.service';

@Injectable()
export class FileService {
	private readonly s3: S3Client;

	constructor(
		@InjectConfig() private readonly config: ConfigService,
		@InjectDB() private readonly db: Database,
		@Inject(SyncService) private readonly sync: SyncService,
		@InjectClient() private readonly client: InternalService,
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

	private async syncToDatabase(
		tx: Database,
		data: SyncFile,
		bucket?: S3Bucket,
	) {
		return tx
			.insert(File)
			.values(
				'files' in data
					? data.files.map((f) => ({
							type: data.type,
							mimetype: f.mimetype,
							bucket,
						}))
					: [
							{
								type: data.type,
								mimetype: data.file.mimetype,
								bucket,
							},
						],
			)
			.returning({ id: File.id, bucket: File.bucket, mimetype: File.mimetype });
	}

	async syncFile(data: SyncFile) {
		return this.db.transaction(async (tx) => {
			const op = await this.sync.getOptions(data);
			const files = await this.syncToDatabase(
				tx as unknown as Database,
				data,
				op.Bucket,
			);

			await this.sync.execCallback(
				tx as unknown as Database,
				files.map((f) => f.id),
				data,
			);

			await Promise.all(
				'files' in data
					? files.map((f, i) =>
							this.uploadFileToS3(data.files[i], { ...op, Key: f.id }),
						)
					: [this.uploadFileToS3(data.file, { ...op, Key: files[0].id })],
			);

			for (const f of files)
				this.client.emit(Service.EVENT, 'file_uploaded', {
					...data,
					mimetype: f.mimetype,
				});

			return 'files' in data ? files : files[0];
		});
	}

	async deleteFileFromS3(file: { bucket: S3Bucket; id: string }) {
		return this.s3.send(
			new DeleteObjectCommand({ Bucket: file.bucket, Key: file.id }),
		);
	}
}

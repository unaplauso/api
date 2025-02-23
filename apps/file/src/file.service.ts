import {
  DeleteObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConfig } from '@unaplauso/common/decorators';
import { FileTable, InjectDB, InsertFile } from '@unaplauso/database';
import { getSyncFileOptions, SyncFile } from '@unaplauso/files';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class FileService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(
    @InjectConfig() private readonly config: ConfigService,
    @InjectDB() private readonly db: NodePgDatabase,
  ) {
    this.bucket = this.config.getOrThrow('S3_AWS_BUCKET');
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
        Bucket: this.bucket,
        ContentType: file.mimetype,
        ContentEncoding: file.encoding,
        Body: Buffer.from(file.buffer),
        ...metadata,
      },
    }).done();
  }

  private async syncToDatabase(key: string, data: SyncFile) {
    const f: InsertFile = {
      key,
      type: data.type,
      mimetype: data.file.mimetype,
    };

    await this.db
      .insert(FileTable)
      .values(f)
      .onConflictDoUpdate({
        target: FileTable.key,
        set: { mimetype: f.mimetype },
      });
  }

  async syncFile(data: SyncFile) {
    const { dbSyncCallback, ...op } = await getSyncFileOptions(data);
    const upload = await this.uploadFileToS3(data.file, op);
    await this.syncToDatabase(op.Key, data);
    if (dbSyncCallback) await dbSyncCallback();
    return upload.Location ?? op.Key;
  }

  async deleteFile(Key: string) {
    return Promise.all([
      this.db.delete(FileTable).where(eq(FileTable.key, Key)),
      this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key })),
    ]);
  }
}

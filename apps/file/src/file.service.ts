import {
  DeleteObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Inject, Injectable, MisdirectedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConfig } from '@unaplauso/common/decorators';
import { FileTable, InsertFile } from '@unaplauso/database';
import { Database, InjectDB } from '@unaplauso/database/module';
import { SyncFile } from '@unaplauso/files';
import { IS_DEVELOPMENT } from '@unaplauso/validation';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { eq } from 'drizzle-orm';
import { SyncService } from './sync.service';

@Injectable()
export class FileService {
  private readonly s3: S3Client;
  private readonly PUBLIC_BUCKET: string;

  constructor(
    @InjectConfig() private readonly config: ConfigService,
    @InjectDB() private readonly db: Database,
    @Inject(SyncService) private readonly sync: SyncService,
  ) {
    this.PUBLIC_BUCKET = this.config.getOrThrow('S3_AWS_BUCKET_PUBLIC');
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
        Bucket: this.PUBLIC_BUCKET,
        ContentType: file.mimetype,
        ContentEncoding: file.encoding,
        Body: Buffer.from(file.buffer),
        ...metadata,
      },
    }).done();
  }

  private async syncToDatabase(data: SyncFile) {
    const f: InsertFile = {
      type: data.type,
      mimetype: data.file.mimetype,
    };

    return (
      await this.db
        .insert(FileTable)
        .values(f)
        .onConflictDoUpdate({
          target: FileTable.id,
          set: { mimetype: f.mimetype },
        })
        .returning({ id: FileTable.id })
    )[0].id;
  }

  async syncFile(data: SyncFile) {
    const [Key, op] = await Promise.all([
      this.syncToDatabase(data),
      this.sync.getOptions(data),
    ]);

    try {
      await Promise.all([
        this.uploadFileToS3(data.file, { ...op, Key }),
        this.sync.execCallback(Key, data),
      ]);

      return Key;
    } catch (e: unknown) {
      await this.deleteFile(Key, op.Bucket ?? this.PUBLIC_BUCKET);
      throw new MisdirectedException(IS_DEVELOPMENT ? e : undefined);
    }
  }

  async deleteFile(Key: string, Bucket = this.PUBLIC_BUCKET) {
    return Promise.all([
      this.db.delete(FileTable).where(eq(FileTable.id, Key)),
      this.s3.send(new DeleteObjectCommand({ Bucket, Key })),
    ]);
  }
}

import {
	boolean,
	pgEnum,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

export enum FileType {
	PROFILE_PIC = 'profile_pic',
	PROFILE_BANNER = 'profile_banner',
	PROJECT_FILE = 'project_file',
	PROJECT_THUMBNAIL = 'project_thumbnail',
}

export enum S3Bucket {
	PUBLIC = 'unaplauso-public',
}

export const FileTypeEnum = pgEnum(
	'file_type',
	Object.values(FileType) as [FileType],
);

export const S3BucketEnum = pgEnum(
	's3_bucket',
	Object.values(S3Bucket) as [S3Bucket],
);

export const File = pgTable('file', {
	id: uuid().notNull().primaryKey().defaultRandom(),
	bucket: S3BucketEnum().notNull().default(S3Bucket.PUBLIC),
	type: FileTypeEnum().notNull(),
	mimetype: varchar({ length: 96 }),
	createdAt: timestamp().notNull().defaultNow(),
	isNsfw: boolean().notNull().default(false),
});

/* TRIGGERS
- file_deleted
*/

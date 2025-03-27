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

export const FileTable = pgTable('file', {
	id: uuid().notNull().primaryKey().defaultRandom(),
	bucket: S3BucketEnum().notNull().default(S3Bucket.PUBLIC),
	type: FileTypeEnum().notNull(),
	mimetype: varchar({ length: 96 }),
	createdAt: timestamp().notNull().defaultNow(),
	isNsfw: boolean().notNull().default(false),
});

/* TRIGGERS
CREATE OR REPLACE FUNCTION notify_file_deleted()
RETURNS trigger AS $$
BEGIN
	PERFORM pg_notify('file_deleted', OLD.id::text);
	RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER file_deleted
AFTER DELETE ON "file"
FOR EACH ROW EXECUTE FUNCTION notify_file_deleted();
*/

import { aliasedTable, sql } from 'drizzle-orm';
import type { InferSQLType, TSQLObject } from '.';
import { File } from '../schema/file.schema';

export const aliasedColumn = <T extends TSQLObject>(col: T, alias: string) =>
	sql<InferSQLType<T>>`${col}`.as(alias);

export const aliasedNullableColumn = <T extends TSQLObject>(
	col: T,
	alias: string,
) => sql<InferSQLType<T> | null>`${col}`.as(alias);

export const ProfilePicFile = aliasedTable(File, 'profile_pic_file');

export const ProfileBannerFile = aliasedTable(File, 'profile_banner_file');

export const ProjectThumbnailFile = aliasedTable(
	File,
	'project_thumbnail_file',
);

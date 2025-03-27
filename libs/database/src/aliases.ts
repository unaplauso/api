import { aliasedTable } from 'drizzle-orm';
import { FileTable } from './schema/file.schema';

export const ProfilePicFileTable = aliasedTable(FileTable, 'profile_pic_file');

export const ProfileBannerFileTable = aliasedTable(
	FileTable,
	'profile_banner_file',
);

export const ProjectThumbnailFileTable = aliasedTable(
	FileTable,
	'project_thumbnail_file',
);

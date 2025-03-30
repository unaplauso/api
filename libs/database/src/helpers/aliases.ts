import { aliasedTable } from 'drizzle-orm';
import { File } from '../schema/file.schema';

export const ProfilePicFile = aliasedTable(File, 'profile_pic_file');

export const ProfileBannerFile = aliasedTable(File, 'profile_banner_file');

export const ProjectThumbnailFile = aliasedTable(
	File,
	'project_thumbnail_file',
);

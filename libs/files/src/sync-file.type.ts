import type { FileType } from '@unaplauso/database';
import type { MulterFile } from '@webundsoehne/nest-fastify-file-upload';

export type SyncFile =
	| {
			file: MulterFile;
			type: FileType.PROFILE_BANNER | FileType.PROFILE_PIC;
			userId: number;
	  }
	| {
			file: MulterFile;
			type: FileType.PROJECT_THUMBNAIL;
			projectId: number;
			userId: number;
	  }
	| {
			files: MulterFile[];
			type: FileType.PROJECT_FILE;
			projectId: number;
			userId: number;
	  }
	| {
			file: MulterFile;
			type: Exclude<
				FileType,
				| FileType.PROFILE_BANNER
				| FileType.PROFILE_PIC
				| FileType.PROJECT_FILE
				| FileType.PROJECT_THUMBNAIL
			>;
	  };

export type SyncDeleteFile =
	| {
			type: FileType.PROFILE_BANNER | FileType.PROFILE_PIC;
			userId: number;
	  }
	| {
			type: FileType.PROJECT_FILE;
			fileIds: string[];
			projectId: number;
			userId: number;
	  }
	| {
			type: FileType.PROJECT_THUMBNAIL;
			projectId: number;
			userId: number;
	  }
	| {
			type: Exclude<
				FileType,
				| FileType.PROFILE_BANNER
				| FileType.PROFILE_PIC
				| FileType.PROJECT_FILE
				| FileType.PROJECT_THUMBNAIL
			>;
	  };

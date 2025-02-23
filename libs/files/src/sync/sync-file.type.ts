import { FileType } from '@unaplauso/database/schema/file.schema';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload';

export type SyncFile =
  | {
      file: MulterFile;
      type: FileType.PROFILE_BANNER | FileType.PROFILE_PIC;
      userId: number;
    }
  | {
      file: MulterFile;
      type: Exclude<FileType, FileType.PROFILE_BANNER | FileType.PROFILE_PIC>;
    };

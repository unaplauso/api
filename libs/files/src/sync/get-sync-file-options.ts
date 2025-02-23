import { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { FileType } from '@unaplauso/database';
import { SyncFile } from './sync-file.type';

export type SyncFileOptions = Omit<PutObjectCommandInput, 'Bucket'> & {
  Key: string;
  dbSyncCallback?: () => Promise<void>;
};

export const getSyncFileOptions = async (
  x: SyncFile,
): Promise<SyncFileOptions> => {
  if (x.type === FileType.PROFILE_PIC || x.type === FileType.PROFILE_BANNER) {
    return { Key: `${x.userId}-${x.type}`, ACL: 'public-read' };
  }

  return x.type;
};

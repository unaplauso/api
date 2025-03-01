import { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { FileType, InjectDB, UserTable } from '@unaplauso/database';
import { SyncFile } from '@unaplauso/files';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class SyncService {
  constructor(@InjectDB() private readonly db: NodePgDatabase) {}

  private async profilePicCallback(id: string, userId: number) {
    return this.db
      .update(UserTable)
      .set({ profilePicFileId: id })
      .where(eq(UserTable.id, userId));
  }

  private async profileBannerCallback(id: string, userId: number) {
    return this.db
      .update(UserTable)
      .set({ profileBannerFileId: id })
      .where(eq(UserTable.id, userId));
  }

  async execCallback(id: string, data: SyncFile): Promise<unknown> {
    if (data.type === FileType.PROFILE_PIC)
      return this.profilePicCallback(id, data.userId);
    else if (data.type === FileType.PROFILE_BANNER)
      return this.profileBannerCallback(id, data.userId);
    else return data.type;
  }

  async getOptions({
    type: t,
  }: SyncFile): Promise<Partial<PutObjectCommandInput>> {
    if (t === FileType.PROFILE_PIC) return {};
    else if (t === FileType.PROFILE_BANNER) return {};
    else return t;
  }
}

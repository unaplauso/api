import { Injectable } from '@nestjs/common';
import { InjectDB, UserTable } from '@unaplauso/database';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class UserService {
  constructor(@InjectDB() private readonly db: NodePgDatabase) {}

  async readUserProfilePic(userId: number) {
    return (
      await this.db
        .select({ id: UserTable.profilePicFileId })
        .from(UserTable)
        .where(eq(UserTable.id, userId))
    ).at(0)?.id;
  }

  async readUserProfileBanner(userId: number) {
    return (
      await this.db
        .select({ id: UserTable.profileBannerFileId })
        .from(UserTable)
        .where(eq(UserTable.id, userId))
    ).at(0)?.id;
  }
}

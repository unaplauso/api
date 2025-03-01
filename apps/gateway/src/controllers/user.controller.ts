import { Controller, Delete, NotFoundException, Put } from '@nestjs/common';
import { NoContent } from '@unaplauso/common/decorators';
import { FileType, InjectDB, UserTable } from '@unaplauso/database';
import { File, FileExt, ReceivesFile, SyncFile } from '@unaplauso/files';
import { InjectClient, InternalService, Service } from '@unaplauso/services';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JwtProtected } from '../decorators/jwt-protected.decorator';
import { UserId } from '../decorators/user-id.decorator';

@Controller('user')
export class UserController {
  constructor(
    @InjectClient() private readonly client: InternalService,
    @InjectDB() private readonly db: NodePgDatabase,
  ) {}

  @JwtProtected()
  @ReceivesFile()
  @Put('profile-pic')
  async putProfilePic(
    @UserId() userId: number,
    @File({ ext: FileExt.IMAGE })
    file: MulterFile,
  ) {
    return this.client.send<string, SyncFile>(Service.FILE, 'sync_file', {
      file,
      userId,
      type: FileType.PROFILE_PIC,
    });
  }

  @JwtProtected()
  @NoContent()
  @Delete('profile-pic')
  async deleteProfilePic(@UserId() userId: number) {
    const { id } = (
      await this.db
        .select({ id: UserTable.profilePicFileId })
        .from(UserTable)
        .where(eq(UserTable.id, userId))
    )[0];

    if (!id) throw new NotFoundException();

    return this.client.send(Service.FILE, 'delete_file', id);
  }

  @JwtProtected()
  @ReceivesFile()
  @Put('profile-banner')
  async putProfileBanner(
    @UserId() userId: number,
    @File({ ext: FileExt.IMAGE })
    file: MulterFile,
  ) {
    return this.client.send<string, SyncFile>(Service.FILE, 'sync_file', {
      file,
      userId,
      type: FileType.PROFILE_BANNER,
    });
  }

  @JwtProtected()
  @NoContent()
  @Delete('profile-banner')
  async deleteProfileBanner(@UserId() userId: number) {
    const { id } = (
      await this.db
        .select({ id: UserTable.profileBannerFileId })
        .from(UserTable)
        .where(eq(UserTable.id, userId))
    )[0];

    if (!id) throw new NotFoundException();

    return this.client.send(Service.FILE, 'delete_file', id);
  }
}

import { Controller, Delete, Put } from '@nestjs/common';
import { NoContent } from '@unaplauso/common/decorators';
import { FileType } from '@unaplauso/database';
import { File, FileExt, ReceivesFile, SyncFile } from '@unaplauso/files';
import { InjectClient, InternalService, Service } from '@unaplauso/services';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { firstValueFrom } from 'rxjs';
import { JwtProtected } from '../decorators/jwt-protected.decorator';
import { UserId } from '../decorators/user-id.decorator';

@Controller('user')
export class UserController {
  constructor(@InjectClient() private readonly client: InternalService) {}

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
    const id = await firstValueFrom<string>(
      await this.client.send(Service.OPEN, 'read_user_profile_pic', userId),
    );

    return !id ? true : this.client.send(Service.FILE, 'delete_file', id);
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
    const id = await firstValueFrom<string>(
      await this.client.send(Service.OPEN, 'read_user_profile_banner', userId),
    );

    return !id ? true : this.client.send(Service.FILE, 'delete_file', id);
  }
}

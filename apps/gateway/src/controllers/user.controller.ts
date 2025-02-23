import { Controller, Delete, Put } from '@nestjs/common';
import { NoContent } from '@unaplauso/common/decorators';
import { FileType } from '@unaplauso/database';
import { File, FileExt, ReceivesFile, SyncFile } from '@unaplauso/files';
import { InjectCLI, InternalService, Service } from '@unaplauso/services';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { JwtProtected } from '../decorators/jwt-protected.decorator';
import { UserId } from '../decorators/user-id.decorator';

@Controller('user')
export class UserController {
  constructor(@InjectCLI() private readonly client: InternalService) {}

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
    return this.client.send(
      Service.FILE,
      'delete_file',
      `${userId}-profile_pic`,
    );
  }
}

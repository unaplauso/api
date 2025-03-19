import { Controller } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { SyncFile } from '@unaplauso/files/sync-file.type';
import { NoContent } from '@unaplauso/services';
import { Pattern } from './decorators/pattern.decorator';
import { FileService } from './file.service';

@Controller()
export class FileController {
  constructor(private readonly service: FileService) {}

  @NoContent()
  @Pattern('health_check')
  async healthCheck() {
    return true;
  }

  @Pattern('sync_file')
  async syncFile(@Payload() data: SyncFile) {
    return this.service.syncFile(data);
  }

  @NoContent()
  @Pattern('delete_file')
  async deleteFile(@Payload() key: string) {
    return this.service.deleteFile(key);
  }
}

import { Controller, Inject } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { NoContent } from '@unaplauso/common/decorators';
import { Pattern } from './decorators/pattern.decorator';
import { FileService } from './file.service';
import { SyncService } from './sync.service';
import type { SyncFile, SyncDeleteFile } from '@unaplauso/files';

@Controller()
export class FileController {
	constructor(
		@Inject(FileService) private readonly file: FileService,
		@Inject(SyncService) private readonly sync: SyncService,
	) {}

	@NoContent()
	@Pattern('health_check')
	async healthCheck() {
		return true;
	}

	@Pattern('sync_file')
	async syncFile(@Payload() data: SyncFile) {
		return this.file.syncFile(data);
	}

	@NoContent()
	@Pattern('delete_file')
	async deleteFile(@Payload() data: SyncDeleteFile) {
		return this.sync.execDelete(data);
	}
}

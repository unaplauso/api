import { Module } from '@nestjs/common';
import { LocalConfigModule } from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database/module';
import { InternalModule } from '@unaplauso/services';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { SyncService } from './sync.service';

@Module({
	imports: [LocalConfigModule(), InternalModule, DatabaseModule],
	controllers: [FileController],
	providers: [FileService, SyncService],
})
export class FileModule {}

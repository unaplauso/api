import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { LocalConfigModule } from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database';

@Module({
  imports: [LocalConfigModule(), DatabaseModule],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}

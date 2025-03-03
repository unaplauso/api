import { Module } from '@nestjs/common';
import { LocalConfigModule } from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database';
import { OpenController } from './open.controller';
import { TopicService } from './services/topic.service';
import { UserService } from './services/user.service';

@Module({
  imports: [LocalConfigModule(), DatabaseModule],
  controllers: [OpenController],
  providers: [UserService, TopicService],
})
export class OpenModule {}

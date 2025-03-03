import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { LocalConfigModule } from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database';

@Module({
  imports: [LocalConfigModule(), DatabaseModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}

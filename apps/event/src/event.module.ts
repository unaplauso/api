import { Module } from '@nestjs/common';
import { LocalConfigModule } from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database/module';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  imports: [LocalConfigModule(), DatabaseModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}

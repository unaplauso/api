import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LocalCacheModule, LocalConfigModule } from '@unaplauso/common/modules';
import { LocalHttpModule } from '@unaplauso/common/modules/local-http.module';
import { DatabaseModule } from '@unaplauso/database/module';
import { CronService } from './cron.service';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
	imports: [
		LocalConfigModule(),
		DatabaseModule,
		LocalCacheModule(),
		LocalHttpModule(),
		ScheduleModule.forRoot(),
	],
	controllers: [EventController],
	providers: [EventService, CronService],
})
export class EventModule {}

import { Module } from '@nestjs/common';
import { seconds } from '@nestjs/throttler';
import {
	GlobalThrottlerProvider,
	LocalCacheModule,
	LocalConfigModule,
	LocalJwtModule,
	LocalThrottlerModule,
} from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database/module';
import { InternalModule } from '@unaplauso/services';
import { CreatorController } from './controllers/creator.controller';
import { DonationController } from './controllers/donation.controller';
import { FavoriteController } from './controllers/favorite.controller';
import { HealthController } from './controllers/health.controller';
import { ProjectController } from './controllers/project.controller';
import { ReportController } from './controllers/report.controller';
import { TopicController } from './controllers/topic.controller';
import { UserController } from './controllers/user.controller';

@Module({
	imports: [
		LocalConfigModule(),
		InternalModule,
		DatabaseModule,
		LocalCacheModule({ ttl: seconds(45) }),
		LocalJwtModule(),
		LocalThrottlerModule(),
	],
	providers: [GlobalThrottlerProvider],
	controllers: [
		CreatorController,
		DonationController,
		FavoriteController,
		HealthController,
		ProjectController,
		ReportController,
		TopicController,
		UserController,
	],
})
export class AppModule {}

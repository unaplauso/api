import { Module } from '@nestjs/common';
import { LocalConfigModule } from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database/module';
import { OpenController } from './open.controller';
import { CreatorService } from './services/creator.service';
import { DonationService } from './services/donation.service';
import { ProjectService } from './services/project.service';
import { TopicService } from './services/topic.service';
import { UserService } from './services/user.service';

@Module({
	imports: [LocalConfigModule(), DatabaseModule],
	controllers: [OpenController],
	providers: [
		UserService,
		TopicService,
		ProjectService,
		CreatorService,
		DonationService,
	],
})
export class OpenModule {}

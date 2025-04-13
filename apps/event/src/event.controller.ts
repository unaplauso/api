import { Controller, Inject } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { NoContent } from '@unaplauso/common/decorators';
import type { S3Bucket } from '@unaplauso/database';
import { CronService } from './cron.service';
import { Pattern } from './decorators/pattern.decorator';
import { EventService } from './event.service';

@Controller()
export class EventController {
	constructor(
		@Inject(EventService) private readonly event: EventService,
		@Inject(CronService) private readonly cron: CronService,
	) {}

	@NoContent()
	@Pattern('health_check')
	async healthCheck() {
		return true;
	}

	@NoContent()
	@Pattern('file_uploaded')
	async fileUploaded(
		@Payload() dto: { id: string; bucket: S3Bucket; mimetype: string },
	) {
		return this.event.fileUploaded(dto.id, dto.bucket, dto.mimetype);
	}

	@NoContent()
	@Pattern('project_read')
	async projectRead(@Payload() id: number) {
		return this.event.projectRead(id);
	}

	@NoContent()
	@Pattern('creator_read')
	async creatorRead(@Payload() idOrUsername: string | number) {
		return this.event.creatorRead(idOrUsername);
	}

	@NoContent()
	@Pattern('refresh_top_project')
	async refreshTopProject() {
		return this.cron.refreshTopProject();
	}

	@NoContent()
	@Pattern('refresh_top_creator')
	async refreshTopCreator(@Payload() refresh?: boolean) {
		return this.cron.refreshTopCreator(refresh ?? true);
	}
}

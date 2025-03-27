import { Body, Controller, Post } from '@nestjs/common';
import { NoContent } from '@unaplauso/common/decorators';
import {
	InjectClient,
	type InternalService,
	Service,
} from '@unaplauso/services';
import { IdParam, Validate } from '@unaplauso/validation';
import {
	CreateReportCreatorSchema,
	CreateReportProjectSchema,
	type TCreateReportCreator,
	type TCreateReportProject,
} from '@unaplauso/validation/types';
import { JwtProtected } from '../decorators/jwt-protected.decorator';
import { UserId } from '../decorators/user-id.decorator';

@Controller('report')
export class ReportController {
	constructor(@InjectClient() private readonly client: InternalService) {}

	@JwtProtected()
	@NoContent()
	@Validate('body', CreateReportCreatorSchema)
	@Post('creator/:id')
	async createReportCreator(
		@UserId() userId: number,
		@IdParam() creatorId: number,
		@Body() dto: TCreateReportCreator,
	) {
		return this.client.send(Service.AUDIT, 'create_report_creator', {
			...dto,
			userId,
			creatorId,
		});
	}

	@JwtProtected()
	@NoContent()
	@Validate('body', CreateReportProjectSchema)
	@Post('project/:id')
	async createReportProject(
		@UserId() userId: number,
		@IdParam() projectId: number,
		@Body() dto: TCreateReportProject,
	) {
		return this.client.send(Service.AUDIT, 'create_report_project', {
			...dto,
			userId,
			projectId,
		});
	}
}

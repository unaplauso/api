import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
	JwtProtected,
	NoContent,
	UseCache,
	UserId,
} from '@unaplauso/common/decorators';
import {
	type MpHook,
	MpHookSchema,
} from '@unaplauso/integrations/mercado-pago';
import {
	InjectClient,
	type InternalService,
	Service,
} from '@unaplauso/services';
import { IdParam, Validate } from '@unaplauso/validation';
import {
	type CreateDonation,
	CreateDonationSchema,
	type ListDonation,
	ListDonationSchema,
	type ListTopDonation,
	ListTopDonationSchema,
} from '@unaplauso/validation/types';

@Controller('donation')
export class DonationController {
	constructor(@InjectClient() private readonly client: InternalService) {}

	@Validate('body', CreateDonationSchema)
	@JwtProtected({ strict: false })
	@Post('creator/:id/mercado-pago')
	async createCreatorMercadoPago(
		@UserId() userId: number | null,
		@IdParam() creatorId: number,
		@Body() dto: CreateDonation,
	) {
		return this.client.send(Service.PAYMENT, 'create_creator_mercado_pago', {
			...dto,
			creatorId,
			userId,
		});
	}

	@Validate('body', CreateDonationSchema)
	@JwtProtected({ strict: false })
	@Post('project/:id/mercado-pago')
	async createProjectMercadoPago(
		@UserId() userId: number | null,
		@IdParam() projectId: number,
		@Body() dto: CreateDonation,
	) {
		return this.client.send(Service.PAYMENT, 'create_project_mercado_pago', {
			...dto,
			projectId,
			userId,
		});
	}

	@Validate('query', ListDonationSchema)
	@UseCache()
	@Get('creator/:id')
	async listCreatorDonation(
		@IdParam() creatorId: number,
		@Query() dto: ListDonation,
	) {
		return this.client.send(Service.OPEN, 'list_creator_donation', {
			...dto,
			creatorId,
		});
	}

	@Validate('query', ListTopDonationSchema)
	@UseCache()
	@Get('top/creator/:id')
	async listTopCreatorDonation(
		@IdParam() creatorId: number,
		@Query() dto: ListTopDonation,
	) {
		return this.client.send(Service.OPEN, 'list_top_creator_donation', {
			...dto,
			creatorId,
		});
	}

	@Validate('query', ListDonationSchema)
	@UseCache()
	@Get('project/:id')
	async listProjectDonation(
		@IdParam() projectId: number,
		@Query() dto: ListDonation,
	) {
		return this.client.send(Service.OPEN, 'list_project_donation', {
			...dto,
			projectId,
		});
	}

	@Validate('query', ListTopDonationSchema)
	@UseCache()
	@Get('top/project/:id')
	async listTopProjectDonation(
		@IdParam() projectId: number,
		@Query() dto: ListTopDonation,
	) {
		return this.client.send(Service.OPEN, 'list_top_project_donation', {
			...dto,
			projectId,
		});
	}

	@NoContent()
	@SkipThrottle()
	@Validate('body', MpHookSchema)
	@Post('hook/mercado-pago')
	async hookMercadoPago(@Body() dto: MpHook) {
		return this.client.send(Service.PAYMENT, 'hook_mercado_pago', dto);
	}
}

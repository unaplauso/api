import {
	Body,
	Controller,
	Get,
	Inject,
	ParseFloatPipe,
	Post,
	Query,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import {
	InjectConfig,
	JwtProtected,
	UseCache,
	UserId,
} from '@unaplauso/common/decorators';
import { MercadoPagoService } from '@unaplauso/integrations/mercado-pago';
import {
	InjectClient,
	type InternalService,
	Service,
} from '@unaplauso/services';
import { IdParam, Validate } from '@unaplauso/validation';
import {
	type ListDonation,
	ListDonationSchema,
	type ListTopDonation,
	ListTopDonationSchema,
} from '@unaplauso/validation/types';

@Controller('donation')
export class DonationController {
	constructor(
		@InjectClient() private readonly client: InternalService,
		@InjectConfig() private readonly config: ConfigService,
		@Inject(MercadoPagoService)
		private readonly mercadoPago: MercadoPagoService,
	) {}

	@JwtProtected({ strict: false })
	@Post('creator/:id/mercado-pago')
	async createCreatorMercadoPago(
		@UserId() userId: number | null,
		@IdParam() id: number,
		// FIXME: currency code / id
		@Body(ParseFloatPipe) quantity: number,
	) {
		return this.mercadoPago.getCreatorInitPoint(id, quantity, userId);
	}

	@JwtProtected({ strict: false })
	@Post('project/:id/mercado-pago')
	async createProjectMercadoPago(
		@UserId() userId: number | null,
		@IdParam() id: number,
		// FIXME: currency code / id
		@Body(ParseFloatPipe) quantity: number,
	) {
		return this.mercadoPago.getProjectInitPoint(id, quantity, userId);
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

	@Post('hook/mercado-pago')
	async hookMercadoPago(@Body() dto: unknown) {
		// FIXME: Validar que sea de mp + Salvar donation
		/* 
		{
      "action": "payment.created",
      "api_version": "v1",
      "data": {
        "id": "108387766738"
      },
      "date_created": "2025-04-14T15:51:39Z",
      "id": 120606648984,
      "live_mode": true,
      "type": "payment",
      "user_id": "692240846"
    }
		*/
		return true;
	}
}

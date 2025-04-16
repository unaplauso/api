import { Controller, Inject } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { NoContent } from '@unaplauso/common/decorators';
import {
	MercadoPagoService,
	type MpHook,
} from '@unaplauso/integrations/mercado-pago';
import type {
	UserToCreatorAction,
	UserToProjectAction,
} from '@unaplauso/validation';
import type { CreateDonation } from '@unaplauso/validation/types';
import { Pattern } from './decorators/pattern.decorator';

@Controller()
export class PaymentController {
	constructor(
		@Inject(MercadoPagoService)
		private readonly mercadoPago: MercadoPagoService,
	) {}

	@NoContent()
	@Pattern('health_check')
	async healthCheck() {
		return true;
	}

	@NoContent()
	@Pattern('authorize_mercado_pago')
	async authorizeMercadoPago(@Payload() data: { code: string; state: number }) {
		return this.mercadoPago.connect(data.code, data.state);
	}

	@Pattern('read_mercado_pago')
	async readMercadoPago(@Payload() userId: number) {
		return this.mercadoPago.readMercadoPago(userId);
	}

	@Pattern('create_creator_mercado_pago')
	async createCreatorMercadoPago(
		@Payload() dto: UserToCreatorAction<CreateDonation>,
	) {
		return this.mercadoPago.getCreatorInitPoint(dto);
	}

	@Pattern('create_project_mercado_pago')
	async createProjectMercadoPago(
		@Payload() dto: UserToProjectAction<CreateDonation>,
	) {
		return this.mercadoPago.getProjectInitPoint(dto);
	}

	@Pattern('hook_mercado_pago')
	async hookMercadoPago(@Payload() dto: MpHook) {
		return this.mercadoPago.hook(dto);
	}
}

import { Controller, Inject } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { NoContent } from '@unaplauso/common/decorators';
import { Pattern } from './decorators/pattern.decorator';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
	constructor(
		@Inject(PaymentService) private readonly payment: PaymentService,
	) {}

	@NoContent()
	@Pattern('health_check')
	async healthCheck() {
		return true;
	}

	@NoContent()
	@Pattern('authorize_mercado_pago')
	async authorizeMercadoPago(@Payload() data: { code: string; state: number }) {
		return this.payment.authorizeMercadoPago(data);
	}
}

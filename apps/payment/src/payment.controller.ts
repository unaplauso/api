import { Controller, Inject } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { NoContent } from '@unaplauso/common/decorators';
import type { PaymentCreateRequest } from 'mercadopago/dist/clients/payment/create/types';
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
	@Pattern('create_payment')
	async createPayment(@Payload() { body }: { body: PaymentCreateRequest }) {
		return this.payment.createPayment(body);
	}
}

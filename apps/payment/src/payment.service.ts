import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { InjectConfig } from '@unaplauso/common/decorators';
import MercadoPagoConfig, { Payment } from 'mercadopago';
import type { PaymentCreateRequest } from 'mercadopago/dist/clients/payment/create/types';

@Injectable()
export class PaymentService {
	private readonly mercadoPago: MercadoPagoConfig;

	constructor(
		@InjectConfig() private readonly config: ConfigService,
		// @InjectDB() private readonly db: Database,
	) {
		this.mercadoPago = new MercadoPagoConfig({
			accessToken: this.config.get('MP_ACCESS_TOKEN', 'N'),
		});
	}

	async createPayment(body: PaymentCreateRequest) {
		const payment = await new Payment(this.mercadoPago).create({ body });
	}
}

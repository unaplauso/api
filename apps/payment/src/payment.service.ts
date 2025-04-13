import { Inject, Injectable } from '@nestjs/common';
import { MercadoPagoService } from '@unaplauso/integrations/mercado-pago';

@Injectable()
export class PaymentService {
	constructor(
		@Inject(MercadoPagoService)
		private readonly mercadoPago: MercadoPagoService,
	) {}

	async authorizeMercadoPago(data: { code: string; state: number }) {
		return this.mercadoPago.connect(data.code, data.state);
	}

	async readMercadoPago(userId: number) {
		return this.mercadoPago.getMercadoPagoData(userId);
	}
}

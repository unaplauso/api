import { Controller, Get, Inject, Query, Res } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import {
	InjectConfig,
	JwtProtected,
	UserId,
} from '@unaplauso/common/decorators';
import { MercadoPagoService } from '@unaplauso/integrations/mercado-pago';
import {
	InjectClient,
	type InternalService,
	Service,
} from '@unaplauso/services';
import { Validate } from '@unaplauso/validation';
import type { Response } from 'express';
import { lastValueFrom } from 'rxjs';
import * as v from 'valibot';

@Controller('mercado-pago')
export class MercadoPagoController {
	constructor(
		@InjectClient() private readonly client: InternalService,
		@InjectConfig() private readonly config: ConfigService,
		@Inject(MercadoPagoService)
		private readonly mercadoPago: MercadoPagoService,
	) {}

	@JwtProtected()
	@Get()
	async getAuthorizationUrl(@UserId() userId: number) {
		return this.mercadoPago.getAuthorizationUrl(userId);
	}

	@Validate(
		'query',
		v.strictObject({
			code: v.string(),
			state: v.pipe(v.string(), v.transform(Number.parseInt), v.integer()),
		}),
	)
	@Get('callback')
	async authorizeMercadoPago(
		@Res() res: Response,
		@Query() data: { code: string; state: number },
	) {
		await lastValueFrom(
			await this.client.send(Service.PAYMENT, 'authorize_mercado_pago', data),
		);

		return res.status(302).redirect(
			// FIXME: hablar con valen para path de config
			`${this.config.get('FRONT_REDIRECT_URL', 'http://localhost:3000')}/???`,
		);
	}
}

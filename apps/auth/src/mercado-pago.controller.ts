import {
	Controller,
	Get,
	Query,
	Res,
	UnauthorizedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { InjectConfig, UserId } from '@unaplauso/common/decorators';
import { JwtProtected } from 'apps/gateway/src/decorators/jwt-protected.decorator';
import type { Response } from 'express';
import MercadoPagoConfig, { OAuth } from 'mercadopago';

@Controller('mercado-pago')
export class MercadoPagoController {
	private readonly mercadoPago: MercadoPagoConfig;
	private readonly clientId: string;
	private readonly clientSecret: string;
	private readonly redirctUri: string;

	constructor(@InjectConfig() private readonly config: ConfigService) {
		this.clientId = this.config.getOrThrow('MP_CLIENT_ID');
		this.clientSecret = this.config.getOrThrow('MP_CLIENT_SECRET');
		this.redirctUri = `${this.config.get(
			'AUTH_HOST',
			'http://localhost:5001/api/auth',
		)}/mercado-pago/callback`;

		this.mercadoPago = new MercadoPagoConfig({
			accessToken: this.config.getOrThrow('MP_ACCESS_TOKEN'),
		});
	}

	@JwtProtected()
	@Get()
	async authorize(@Res() res: Response, @UserId() userId: number) {
		return res.status(302).redirect(
			new OAuth(this.mercadoPago).getAuthorizationURL({
				options: {
					client_id: this.clientId,
					redirect_uri: this.redirctUri,
					state: `${userId}`,
				},
			}),
		);
	}

	@Get('callback')
	async connect(@Query('code') code: string) {
		if (!code) throw new UnauthorizedException();

		const credentials = await new OAuth(this.mercadoPago).create({
			body: {
				code,
				client_id: this.clientId,
				client_secret: this.clientSecret,
				redirect_uri: this.redirctUri,
			},
		});

		console.log('HOLA!', { credentials, code });
		return { credentials };
	}
}

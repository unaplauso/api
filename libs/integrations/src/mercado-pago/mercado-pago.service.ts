import type { Cache } from '@nestjs/cache-manager';
import {
	Injectable,
	NotFoundException,
	PreconditionFailedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { minutes } from '@nestjs/throttler';
import { InjectCache, InjectConfig } from '@unaplauso/common/decorators';
import {
	Project,
	User,
	UserDetail,
	UserIntegration,
} from '@unaplauso/database';
import { coalesce } from '@unaplauso/database/functions';
import { type Database, InjectDB } from '@unaplauso/database/module';
import Big from 'big.js';
import { eq, sql } from 'drizzle-orm';
import MercadoPagoConfig, {
	User as MpUser,
	OAuth,
	Payment,
	Preference,
} from 'mercadopago';
import type { OAuthResponse } from 'mercadopago/dist/clients/oAuth/commonTypes';

@Injectable()
export class MercadoPagoService {
	private readonly mercadoPago: MercadoPagoConfig;
	private readonly clientId: string;
	private readonly clientSecret: string;
	private readonly redirctUri: string;

	constructor(
		@InjectDB() private readonly db: Database,
		@InjectConfig() private readonly config: ConfigService,
		@InjectCache() private readonly cache: Cache,
	) {
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

	async getAuthorizationUrl(userId: number) {
		return new OAuth(this.mercadoPago).getAuthorizationURL({
			options: {
				client_id: this.clientId,
				redirect_uri: this.redirctUri,
				state: `${userId}`,
			},
		});
	}

	private async saveCredentials(credentials: OAuthResponse, id: number) {
		if (!credentials.access_token) throw new PreconditionFailedException();

		this.cache.set(
			`mp-token-${id}`,
			credentials.access_token,
			credentials.expires_in ?? minutes(15),
		);

		if (credentials.refresh_token)
			this.db
				.update(UserIntegration)
				.set({ mercadoPagoRefreshToken: credentials.refresh_token })
				.where(eq(UserIntegration.id, id));

		return credentials.access_token;
	}

	private async getToken(creatorId: number, cachedToken?: string | null) {
		const accessToken = await this.cache.get<string>(`mp-token-${creatorId}`);
		if (accessToken) return accessToken;

		const refreshToken =
			cachedToken ??
			(
				await this.db
					.select({ token: UserIntegration.mercadoPagoRefreshToken })
					.from(UserIntegration)
					.where(eq(UserIntegration.id, creatorId))
			).at(0)?.token;

		if (!refreshToken) throw new NotFoundException();

		const credentials = await new OAuth(this.mercadoPago).refresh({
			body: {
				refresh_token: refreshToken,
				client_id: this.clientId,
				client_secret: this.clientSecret,
			},
		});

		if (!credentials?.access_token || !credentials.refresh_token)
			throw new PreconditionFailedException();

		return this.saveCredentials(credentials, creatorId);
	}

	async getMercadoPagoData(userId: number) {
		const token = await this.getToken(userId);
		return new MpUser(new MercadoPagoConfig({ accessToken: token })).get();
	}

	async connect(code: string, userId: number) {
		const credentials = await new OAuth(this.mercadoPago).create({
			body: {
				code,
				client_id: this.clientId,
				client_secret: this.clientSecret,
				redirect_uri: this.redirctUri,
			},
		});

		return this.saveCredentials(credentials, userId);
	}

	private async getInitPoint(data: {
		creatorId: number;
		projectId?: number;
		tag: string;
		pic: string | null;
		quotation: string;
		fee: string;
		refreshToken: string | null;
		quantity: number;
		userId?: number | null;
	}) {
		const accessToken = await this.getToken(data.creatorId, data.refreshToken);

		const quantity = Big(data.quantity).div(data.quotation).round(2).toNumber();

		const preference = await new Preference(
			new MercadoPagoConfig({ accessToken }),
		).create({
			body: {
				metadata: { ...data, refreshToken: undefined },
				auto_return: 'approved',
				binary_mode: true,
				back_urls: {
					// FIXME: hablar con valen para path ok/error al pagar
					success: `${this.config.get('FRONT_REDIRECT_URL', 'http://localhost:3000')}/ok`,
					failure: `${this.config.get('FRONT_REDIRECT_URL', 'http://localhost:3000')}/no-ok`,
				},
				items: [
					{
						id: data.projectId ? `p-${data.projectId}` : `u-${data.creatorId}`,
						unit_price: Number.parseFloat(data.quotation),
						quantity,
						picture_url: data.pic
							? `${this.config.getOrThrow('S3_PUBLIC_URL')}/${data.pic}`
							: undefined,
						title: `👏 ${quantity} aplauso${data.quantity === 1 ? '' : 's'} para "${data.tag}"`,
						description: 'Donación voluntaria vía unaplauso.app',
					},
				],
				marketplace: 'Un Aplauso',
				marketplace_fee: Big(quantity)
					.times(data.quotation)
					.times(data.fee)
					.toNumber(),
			},
		});

		return preference.init_point;
	}

	async getCreatorInitPoint(
		creatorId: number,
		quantity: number,
		userId?: number | null,
	) {
		const data = (
			await this.db
				.select({
					creatorId: UserIntegration.id,
					tag: coalesce(
						User.displayName,
						sql<string>`'@' || ${User.username}`,
						User.email,
					),
					pic: coalesce(User.profilePicFileId, User.profileBannerFileId),
					quotation: UserDetail.quotation,
					fee: UserIntegration.fee,
					refreshToken: UserIntegration.mercadoPagoRefreshToken,
				})
				.from(UserIntegration)
				.innerJoin(User, eq(User.id, UserIntegration.id))
				.innerJoin(UserDetail, eq(UserDetail.id, UserIntegration.id))
				.where(eq(UserIntegration.id, creatorId))
		).at(0);
		if (!data?.refreshToken) throw new NotFoundException();
		return this.getInitPoint({ ...data, quantity, userId });
	}

	async getProjectInitPoint(
		projectId: number,
		quantity: number,
		userId?: number | null,
	) {
		const data = (
			await this.db
				.select({
					creatorId: Project.creatorId,
					projectId: Project.id,
					tag: Project.title,
					pic: Project.thumbnailFileId,
					quotation: Project.quotation,
					fee: Project.fee,
					refreshToken: UserIntegration.mercadoPagoRefreshToken,
				})
				.from(Project)
				.innerJoin(UserIntegration, eq(UserIntegration.id, Project.creatorId))
				.where(eq(Project.id, projectId))
		).at(0);
		if (!data?.refreshToken) throw new NotFoundException();
		return this.getInitPoint({ ...data, quantity, userId });
	}

	async hook(dto: { id: number; date_created: Date }) {
		console.log(dto);
		return new Payment(this.mercadoPago).get({ id: dto.id });
	}
}

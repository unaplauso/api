import type { Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { days } from '@nestjs/throttler';
import { InjectCache, InjectConfig } from '@unaplauso/common/decorators';
import { type InsertUser, User } from '@unaplauso/database';
import { lowerEq } from '@unaplauso/database/functions';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type AccessData from './types/access-data.type';

@Injectable()
export class AuthService {
	private readonly FRONT_REDIRECT_URL: string;
	private readonly JWT_REFRESH_SECRET: string;

	constructor(
		@InjectConfig() private readonly config: ConfigService,
		@InjectCache() private readonly cache: Cache,
		@InjectDB() private readonly db: Database,
		@Inject(JwtService) private readonly jwt: JwtService,
	) {
		this.FRONT_REDIRECT_URL = `${this.config.get('FRONT_REDIRECT_URL', 'http://localhost:3000')}/onboarding/?user_data=`;
		this.JWT_REFRESH_SECRET = this.config.get('JWT_REFRESH_SECRET', 'secret');
	}

	private async issueTokens(id: number, isNew = false) {
		const [accessToken, refreshToken] = await Promise.all([
			this.jwt.signAsync({ id }),
			this.jwt.signAsync(
				{ id },
				{
					algorithm: 'HS512',
					secret: this.JWT_REFRESH_SECRET,
					expiresIn: '30d',
				},
			),
		]);

		await this.cache.set(`${id}`, refreshToken, days(30));
		return { accessToken, refreshToken, isNew };
	}

	getRedirectUrl(token: AccessData) {
		return `${this.FRONT_REDIRECT_URL}${JSON.stringify(token)}`;
	}

	async refreshToken(token: string) {
		try {
			const { id } = await this.jwt.verifyAsync(token, {
				secret: this.JWT_REFRESH_SECRET,
			});

			if ((await this.cache.get<string>(`${id}`)) !== token) throw new Error();

			return this.issueTokens(id);
		} catch {
			throw new UnauthorizedException();
		}
	}

	async handleOauth(user: InsertUser): Promise<AccessData> {
		const existingUser = (
			await this.db
				.select({ id: User.id })
				.from(User)
				.where(lowerEq(User.email, user.email))
		).at(0);

		return this.issueTokens(
			existingUser?.id ??
				(await this.db.insert(User).values(user).returning({ id: User.id }))[0]
					.id,
			!existingUser?.id,
		);
	}
}

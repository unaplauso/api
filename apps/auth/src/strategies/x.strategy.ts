import { Injectable, PreconditionFailedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { type Profile, Strategy } from '@superfaceai/passport-twitter-oauth2';
import { InjectConfig } from '@unaplauso/common/decorators';
import type { InsertUser } from '@unaplauso/database';
import type { VerifyCallback } from 'passport-google-oauth20';
import OauthStrategy from '../oauth-strategy.enum';

@Injectable()
export class XStrategy extends PassportStrategy(Strategy, OauthStrategy.X) {
	constructor(@InjectConfig() readonly config: ConfigService) {
		super({
			clientType: 'public',
			clientID: config.getOrThrow('X_CLIENT_ID'),
			clientSecret: config.getOrThrow('X_CLIENT_SECRET'),
			callbackURL: '/api/auth/x/callback',
			scope: ['email'],
		});
	}

	async validate(
		_token: string,
		_tokenSecret: string,
		profile: Profile,
		done: VerifyCallback,
	): Promise<InsertUser> {
		const email = profile.emails?.[0]?.value;
		if (!email) throw new PreconditionFailedException();
		const displayName = profile.displayName?.trim();
		const user = { email, displayName };
		done(null, user);
		return user;
	}
}

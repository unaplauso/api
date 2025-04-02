import { Injectable, PreconditionFailedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectConfig } from '@unaplauso/common/decorators';
import type { InsertUser } from '@unaplauso/database';
import { type Profile, Strategy } from 'passport-facebook';
import type { VerifyCallback } from 'passport-google-oauth20';
import OauthStrategy from '../oauth-strategy.enum';

@Injectable()
export class FacebookStrategy extends PassportStrategy(
	Strategy,
	OauthStrategy.FACEBOOK,
) {
	constructor(@InjectConfig() readonly config: ConfigService) {
		super({
			clientID: config.getOrThrow('FACEBOOK_CLIENT_ID'),
			clientSecret: config.getOrThrow('FACEBOOK_CLIENT_SECRET'),
			callbackURL: `${config.get(
				'AUTH_HOST',
				'http://localhost:5001/api/auth',
			)}/api/auth/facebook/callback`,
			profileFields: ['emails', 'name'],
			scope: ['email'],
		});
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: Profile,
		done: VerifyCallback,
	): Promise<InsertUser> {
		const email = profile.emails?.[0]?.value;
		if (!email) throw new PreconditionFailedException();

		const displayName =
			`${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`.trim() ||
			undefined;

		const user = { email, displayName };
		done(null, user);
		return user;
	}
}

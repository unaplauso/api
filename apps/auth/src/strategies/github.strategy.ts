import { Injectable, PreconditionFailedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectConfig } from '@unaplauso/common/decorators';
import type { InsertUser } from '@unaplauso/database';
import { type Profile, Strategy } from 'passport-github2';
import type { VerifyCallback } from 'passport-google-oauth20';
import OauthStrategy from '../oauth-strategy.enum';

@Injectable()
export class GithubStrategy extends PassportStrategy(
	Strategy,
	OauthStrategy.GITHUB,
) {
	constructor(@InjectConfig() readonly config: ConfigService) {
		super({
			clientID: config.getOrThrow('GITHUB_CLIENT_ID'),
			clientSecret: config.getOrThrow('GITHUB_CLIENT_SECRET'),
			callbackURL: '/api/auth/github/callback',
			scope: ['user:email'],
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

		const user = { email, displayName: profile.displayName };
		done(null, user);
		return user;
	}
}

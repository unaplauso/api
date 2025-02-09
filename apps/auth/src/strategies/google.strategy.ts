import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectConfig } from '@unaplauso/common/decorators/inject-config.decorator';
import { InsertUser } from '@unaplauso/database';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import OauthStrategy from '../oauth-strategy.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  OauthStrategy.GOOGLE,
) {
  constructor(@InjectConfig() readonly config: ConfigService) {
    super({
      clientID: config.getOrThrow('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow('GOOGLE_CLIENT_SECRET'),
      callbackURL: '/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<InsertUser> {
    const email = profile.emails![0];

    if (!email?.value || !email?.verified)
      throw new PreconditionFailedException();

    const name =
      `${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`.trim() ||
      undefined;

    const user = { email: email.value, name };
    done(null, user);
    return user;
  }
}

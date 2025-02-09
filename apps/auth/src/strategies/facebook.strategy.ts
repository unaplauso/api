import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectConfig } from '@unaplauso/common/decorators/inject-config.decorator';
import { InsertUser } from '@unaplauso/database';
import { Profile, Strategy } from 'passport-facebook';
import { VerifyCallback } from 'passport-google-oauth20';
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
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['emails', 'name'],
      scope: 'email',
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<InsertUser> {
    const email = profile.emails![0]?.value;
    if (!email) throw new PreconditionFailedException();

    const name =
      `${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`.trim() ||
      undefined;

    const user = { email, name };
    done(null, user);
    return user;
  }
}

import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectConfig } from '@unaplauso/common/decorators/inject-config.decorator';
import { InsertUser } from '@unaplauso/database';
import Strategy, { Profile } from 'passport-discord';
import { VerifyCallback } from 'passport-google-oauth20';
import OauthStrategy from '../oauth-strategy.enum';

@Injectable()
export class DiscordStrategy extends PassportStrategy(
  Strategy,
  OauthStrategy.DISCORD,
) {
  constructor(@InjectConfig() readonly config: ConfigService) {
    super({
      clientID: config.getOrThrow('DISCORD_CLIENT_ID'),
      clientSecret: config.getOrThrow('DISCORD_CLIENT_SECRET'),
      callbackURL: '/api/auth/discord/callback',
      scope: ['identify', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<InsertUser> {
    const email = profile.email;
    if (!email) throw new PreconditionFailedException();
    const user = { email, name: profile.global_name?.trim() };
    done(null, user);
    return user;
  }
}

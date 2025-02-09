import {
  Inject,
  Injectable,
  PreconditionFailedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InsertUser } from '@unaplauso/database';
import { VerifyCallback } from 'passport-google-oauth20';
import { Profile, Strategy } from 'passport-twitter';
import OauthStrategy from '../oauth-strategy.enum';

@Injectable()
export class XStrategy extends PassportStrategy(Strategy, OauthStrategy.X) {
  constructor(@Inject(ConfigService) readonly config: ConfigService) {
    super({
      consumerKey: config.getOrThrow('X_CONSUMER_KEY'),
      consumerSecret: config.getOrThrow('X_CONSUMER_SECRET'),
      callbackURL: '/api/auth/x/callback',
      includeEmail: true,
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
    const name = profile.displayName?.trim();
    const user = { email, name };
    done(null, user);
    return user;
  }
}

import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserInsertDto } from '@unaplauso/database';
import { Strategy } from 'passport-twitter';

@Injectable()
export class XStrategy extends PassportStrategy(Strategy, 'x') {
  constructor() {
    super({
      consumerKey: process.env.X_CONSUMER_KEY,
      consumerSecret: process.env.X_CONSUMER_SECRET,
      callbackURL: '/api/auth/x/callback',
      includeEmail: true,
      session: false,
    });
  }

  async validate(
    _token: string,
    _tokenSecret: string,
    profile: any,
    done: any,
  ): Promise<UserInsertDto> {
    const id = profile.id;
    const email = profile.emails?.[0]?.value;

    if (!email || !id) throw new PreconditionFailedException();

    const name = profile.displayName || undefined;

    const user = { email, name };
    done(null, user);
    return user;
  }
}

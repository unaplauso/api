import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserInsertDto } from '@unaplauso/database';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['emails', 'name'],
      scope: 'email',
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<UserInsertDto> {
    const id = profile.id;
    const email = profile.emails![0]?.value;

    if (!email || !id) throw new PreconditionFailedException();

    const name =
      `${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`.trim() ||
      undefined;

    const user = { email, name };
    done(null, user);
    return user;
  }
}

import { Controller, Get, Req, Res } from '@nestjs/common';
import { UserInsertDto } from '@unaplauso/database';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GetOauthCallback } from './decorators/get-oauth-callback.decorator';
import { GetOauth } from './decorators/get-oauth.decorator';
import OauthStrategy from './oauth-strategy.enum';

@Controller()
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Get('health')
  health() {
    return 'OK';
  }

  private redirectToFront(res: Response, token: string) {
    return res.status(302).redirect(this.service.getRedirectUrl(token));
  }

  /* Logout explícito para testing:
    https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout 
  */
  @GetOauth(OauthStrategy.GOOGLE) async googleAuth() {}
  @GetOauthCallback(OauthStrategy.GOOGLE) googleAuthRedirect(
    @Req() { user }: { user: UserInsertDto },
    @Res() res: Response,
  ) {
    return this.redirectToFront(res, this.service.handleOauth(user));
  }

  @GetOauth(OauthStrategy.X) async xAuth() {}
  @GetOauthCallback(OauthStrategy.X) xAuthRedirect(
    @Req() { user }: { user: UserInsertDto },
    @Res() res: Response,
  ) {
    return this.redirectToFront(res, this.service.handleOauth(user));
  }

  @GetOauth(OauthStrategy.FACEBOOK) async facebookAuth() {}
  @GetOauthCallback(OauthStrategy.FACEBOOK) facebookAuthRedirect(
    @Req() { user }: { user: UserInsertDto },
    @Res() res: Response,
  ) {
    return this.redirectToFront(res, this.service.handleOauth(user));
  }
}

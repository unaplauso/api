import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GetOauthCallback } from './decorators/get-oauth-callback.decorator';
import { GetOauth } from './decorators/get-oauth.decorator';
import OauthStrategy from './oauth-strategy.enum';
import AccessData from './types/access-data.type';
import { InsertUser } from '@unaplauso/database';

@Controller()
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Get('health')
  health() {
    return 'OK';
  }

  @Post('refresh-token')
  refreshToken(@Body('refreshToken') token: string) {
    return this.service.refreshToken(token);
  }

  private redirectToFront(res: Response, tokens: AccessData) {
    return res.status(302).redirect(this.service.getRedirectUrl(tokens));
  }

  /* Logout explícito para testing:
    https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout 
  */
  @GetOauth(OauthStrategy.GOOGLE) async googleAuth() {}
  @GetOauthCallback(OauthStrategy.GOOGLE) async googleAuthRedirect(
    @Req() { user }: { user: InsertUser },
    @Res() res: Response,
  ) {
    return this.redirectToFront(res, await this.service.handleOauth(user));
  }

  @GetOauth(OauthStrategy.X) async xAuth() {}
  @GetOauthCallback(OauthStrategy.X) async xAuthRedirect(
    @Req() { user }: { user: InsertUser },
    @Res() res: Response,
  ) {
    return this.redirectToFront(res, await this.service.handleOauth(user));
  }

  @GetOauth(OauthStrategy.FACEBOOK) async facebookAuth() {}
  @GetOauthCallback(OauthStrategy.FACEBOOK) async facebookAuthRedirect(
    @Req() { user }: { user: InsertUser },
    @Res() res: Response,
  ) {
    return this.redirectToFront(res, await this.service.handleOauth(user));
  }

  @GetOauth(OauthStrategy.DISCORD) async discordAuth() {}
  @GetOauthCallback(OauthStrategy.DISCORD) async discordAuthRedirect(
    @Req() { user }: { user: InsertUser },
    @Res() res: Response,
  ) {
    return this.redirectToFront(res, await this.service.handleOauth(user));
  }
}

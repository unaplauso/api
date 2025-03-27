import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import { NoContent } from '@unaplauso/common/decorators';
import type { InsertUser } from '@unaplauso/database';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { GetOauthCallback } from './decorators/get-oauth-callback.decorator';
import { GetOauth } from './decorators/get-oauth.decorator';
import OauthStrategy from './oauth-strategy.enum';
import type AccessData from './types/access-data.type';

@Controller()
export class AuthController {
	constructor(@Inject(AuthService) private readonly auth: AuthService) {}

	@NoContent()
	@Get('health')
	health() {
		return true;
	}

	@Post('refresh-token')
	refreshToken(@Body('refreshToken') token: string) {
		return this.auth.refreshToken(token);
	}

	private redirectToFront(res: Response, tokens: AccessData) {
		return res.status(302).redirect(this.auth.getRedirectUrl(tokens));
	}

	@GetOauth(OauthStrategy.GOOGLE) async googleAuth() {}
	@GetOauthCallback(OauthStrategy.GOOGLE) async googleAuthRedirect(
		@Req() { user }: { user: InsertUser },
		@Res() res: Response,
	) {
		return this.redirectToFront(res, await this.auth.handleOauth(user));
	}

	@GetOauth(OauthStrategy.X) async xAuth() {}
	@GetOauthCallback(OauthStrategy.X) async xAuthRedirect(
		@Req() { user }: { user: InsertUser },
		@Res() res: Response,
	) {
		return this.redirectToFront(res, await this.auth.handleOauth(user));
	}

	@GetOauth(OauthStrategy.FACEBOOK) async facebookAuth() {}
	@GetOauthCallback(OauthStrategy.FACEBOOK) async facebookAuthRedirect(
		@Req() { user }: { user: InsertUser },
		@Res() res: Response,
	) {
		return this.redirectToFront(res, await this.auth.handleOauth(user));
	}

	@GetOauth(OauthStrategy.DISCORD) async discordAuth() {}
	@GetOauthCallback(OauthStrategy.DISCORD) async discordAuthRedirect(
		@Req() { user }: { user: InsertUser },
		@Res() res: Response,
	) {
		return this.redirectToFront(res, await this.auth.handleOauth(user));
	}

	@GetOauth(OauthStrategy.GITHUB) async githubAuth() {}
	@GetOauthCallback(OauthStrategy.GITHUB) async githubAuthRedirect(
		@Req() { user }: { user: InsertUser },
		@Res() res: Response,
	) {
		return this.redirectToFront(res, await this.auth.handleOauth(user));
	}
}

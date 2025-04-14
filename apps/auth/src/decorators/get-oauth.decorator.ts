import { Get, UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOAuth2 } from '@nestjs/swagger';
import type OauthStrategy from '../oauth-strategy.enum';

export const GetOauth = (strategy: OauthStrategy) =>
	applyDecorators(
		ApiOAuth2([], strategy),
		Get(strategy),
		UseGuards(AuthGuard(strategy)),
	);

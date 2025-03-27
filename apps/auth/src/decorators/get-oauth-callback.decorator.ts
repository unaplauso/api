import { Get, UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type OauthStrategy from '../oauth-strategy.enum';

export const GetOauthCallback = (strategy: OauthStrategy) =>
	applyDecorators(Get(`${strategy}/callback`), UseGuards(AuthGuard(strategy)));

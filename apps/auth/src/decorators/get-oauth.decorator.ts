import { Get, UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type OauthStrategy from '../oauth-strategy.enum';

export const GetOauth = (strategy: OauthStrategy) =>
	applyDecorators(Get(strategy), UseGuards(AuthGuard(strategy)));

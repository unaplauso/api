import { applyDecorators, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import OauthStrategy from '../oauth-strategy.enum';

export const GetOauthCallback = (strategy: OauthStrategy) =>
  applyDecorators(Get(`${strategy}/callback`), UseGuards(AuthGuard(strategy)));

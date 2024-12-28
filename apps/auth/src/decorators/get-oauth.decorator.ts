import { applyDecorators, Get, UseGuards } from '@nestjs/common';
import OauthStrategy from '../oauth-strategy.enum';
import { AuthGuard } from '@nestjs/passport';

export const GetOauth = (strategy: OauthStrategy) =>
  applyDecorators(Get(strategy), UseGuards(AuthGuard(strategy)));

import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';
import { SuperGuard } from '../auth/super.guard';

export const SuperProtected = () =>
  applyDecorators(ApiBasicAuth(), UseGuards(SuperGuard));

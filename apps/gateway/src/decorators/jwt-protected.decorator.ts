import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';

export const JwtProtected = () =>
  applyDecorators(ApiBearerAuth(), UseGuards(JwtGuard));

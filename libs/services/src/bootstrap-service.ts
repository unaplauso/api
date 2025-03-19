/**
 * SPDX-License-Identifier: Elastic-2.0
 * Copyright (C) 2025 Un Aplauso
 */

import { Type } from '@nestjs/common';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { NestFactory, Reflector } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ValidResponseInterceptor } from './interceptors/valid-response.interceptor';

export async function bootstrapService(
  module: Type<unknown>,
  extraOptions?: NestApplicationContextOptions,
) {
  const app = await NestFactory.createMicroservice(module, {
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      username: 'default',
      password: process.env.REDIS_PASSWORD,
    },
    ...extraOptions,
  });

  app.useGlobalInterceptors(new ValidResponseInterceptor(new Reflector()));

  await app.listen();
}

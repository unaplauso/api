import { Type } from '@nestjs/common';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';

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

  await app.listen();
}

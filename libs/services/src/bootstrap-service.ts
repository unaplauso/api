/**
 * SPDX-License-Identifier: Elastic-2.0
 * Copyright (C) 2025 Un Aplauso
 */

// biome-ignore lint/suspicious/noExplicitAny: Webpack module
declare const module: any;

import type { INestMicroservice, Type } from '@nestjs/common';
import type { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { NestFactory, Reflector } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { IS_DEVELOPMENT } from '@unaplauso/validation';
import { DatabaseErrorFilter } from './middlewares/database-error.filter';
import { ValidResponseInterceptor } from './middlewares/valid-response.interceptor';

export async function bootstrapService(
	mainModule: Type<unknown>,
	callback?: (app: INestMicroservice) => Promise<unknown>,
	extraOptions?: NestApplicationContextOptions,
) {
	const app = await NestFactory.createMicroservice(mainModule, {
		transport: Transport.REDIS,
		options: {
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT,
			username: 'default',
			password: process.env.REDIS_PASSWORD,
		},
		...extraOptions,
	});

	if (IS_DEVELOPMENT) {
		if (module.hot) {
			module.hot.accept();
			module.hot.dispose(() => app.close());
		}
	}

	app.useGlobalInterceptors(new ValidResponseInterceptor(new Reflector()));
	app.useGlobalFilters(new DatabaseErrorFilter());
	if (callback) await callback(app);
	await app.listen();
}

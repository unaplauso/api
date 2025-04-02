/**
 * SPDX-License-Identifier: Elastic-2.0
 * Copyright (C) 2025 Un Aplauso
 */

// biome-ignore lint/suspicious/noExplicitAny: Webpack module
declare const module: any;

import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import { NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { IS_DEVELOPMENT } from '@unaplauso/validation';
import { AppModule } from './app.module';
import { ClientErrorFilter } from './middlewares/client-error.filter';
import { NotFoundInterceptor } from './middlewares/not-found.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

(async () => {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({
			trustProxy: !IS_DEVELOPMENT,
			logger: IS_DEVELOPMENT,
		}),
	);

	app.setGlobalPrefix('api');
	// biome-ignore lint/suspicious/noExplicitAny: @types version mismatch
	await app.register(fastifyHelmet as any);
	// biome-ignore lint/suspicious/noExplicitAny: @types version mismatch
	await app.register(fastifyMultipart as any);

	app.useGlobalInterceptors(new NotFoundInterceptor());
	app.useGlobalFilters(new ClientErrorFilter());

	// FIXME: if (IS_DEVELOPMENT)
	SwaggerModule.setup(
		'api/docs',
		app,
		SwaggerModule.createDocument(
			app,
			new DocumentBuilder()
				.addBearerAuth()
				.addBasicAuth({ type: 'apiKey', in: 'header', name: 'x-api-key' })
				.build(),
		),
	);

	if (IS_DEVELOPMENT) {
		if (module.hot) {
			module.hot.accept();
			module.hot.dispose(() => app.close());
		}
	}

	await app.listen(process.env.GATEWAY_PORT ?? 5000, '0.0.0.0');
})();

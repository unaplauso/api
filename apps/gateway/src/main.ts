/**
 * SPDX-License-Identifier: Elastic-2.0
 * Copyright (C) 2025 Un Aplauso
 */

import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import { NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IS_DEVELOPMENT } from '@unaplauso/validation';
import { AppModule } from './app.module';
import { ClientErrorFilter } from './middlewares/client-error.filter';
import { NotFoundInterceptor } from './middlewares/not-found.interceptor';

(async () => {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({
			trustProxy: true,
			logger: IS_DEVELOPMENT,
		}),
	);

	app.setGlobalPrefix('api');
	await app.register(fastifyHelmet);
	await app.register(fastifyMultipart);

	app.useGlobalInterceptors(new NotFoundInterceptor());
	app.useGlobalFilters(new ClientErrorFilter());

	if (IS_DEVELOPMENT)
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

	await app.listen(process.env.GATEWAY_PORT ?? 5000, '0.0.0.0');
})();

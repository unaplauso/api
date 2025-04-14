/**
 * SPDX-License-Identifier: Elastic-2.0
 * Copyright (C) 2025 Un Aplauso
 */

import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IS_DEVELOPMENT } from '@unaplauso/validation';
import session from 'cookie-session';
import { AuthModule } from './auth.module';

(async () => {
	const app = await NestFactory.create<NestExpressApplication>(AuthModule);
	app.setGlobalPrefix('api/auth');

	if (!IS_DEVELOPMENT) app.set('trust proxy', true);
	// BUG: else
	SwaggerModule.setup(
		'api/auth/docs',
		app,
		SwaggerModule.createDocument(
			app,
			new DocumentBuilder().addBearerAuth().addOAuth2().build(),
		),
	);

	app.use(
		session({
			secret: process.env.SESSION_SECRET ?? 'secret',
		}),
	);

	await app.listen(process.env.AUTH_PORT ?? 5001);
})();

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
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IS_DEVELOPMENT } from '@unaplauso/validation';
import { AppModule } from './app.module';

/* TODO
- www.figma.com/design/Uc99uG5Boh7OjGca5SCUBs/Un-Aplauso---UI-MVP-(Luka-%26-Valen)?node-id=325-2956&p=f&t=ghLKPnaOUw7byRq0-0
-
- DESCARTADOS DEL MVP:
- Dashboard que sirvan realmente las analíticas y que no sea por poner algo
- listNotifications
- Borrar cuenta (jwt protected no alcanza, AWS SES?) + aplicar protocolo para borrar proyecto
- Favoritos en privado
- Borradores de proyectos
-
- PARA SEGUIR POST-MVP:
- Protocolo de baneo de mails
- Integración OAuth con streamlabs + events al recibir donations
- Login con apple + linkedin
- Sesiones propias (no oauth) -> + SMTP config
- Administration microservice (endpoints con @SuperGuard) + admin panel
- Integración Payway/astropay o algún sistema internacional
*/

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

	if (IS_DEVELOPMENT) {
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

		if (module.hot) {
			module.hot.accept();
			module.hot.dispose(() => app.close());
		}
	}

	await app.listen(process.env.GATEWAY_PORT ?? 5000, '0.0.0.0');
})();

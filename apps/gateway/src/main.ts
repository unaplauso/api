import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/* TODOs 
- FIX LOCAL-CONFIG.MODULE, CARGA SERVICE-SPECIFIC
https://www.figma.com/proto/Uc99uG5Boh7OjGca5SCUBs/Un-Aplauso---UI-MVP-(Luka)?node-id=678-2360&p=f&t=tRClVFjtyi0FsLgl-0&scaling=scale-down&content-scaling=fixed&page-id=325%3A2956&starting-point-node-id=678%3A2360&show-proto-sidebar=1
- NO OLVIDARSE DASHBOARD ENDPOINT
*/

(async () => {
  const app = await NestFactory.create(
    AppModule,
    new FastifyAdapter({ logger: process.env.NODE_ENV !== 'production' }),
  );

  app.setGlobalPrefix('api');

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

  await app.listen(process.env.GATEWAY_PORT ?? 3000, '0.0.0.0');
})();

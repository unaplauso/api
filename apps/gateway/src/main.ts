import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IS_DEVELOPMENT } from '@unaplauso/common/validation';
import { AppModule } from './app.module';

/* TODO
- Busqueda de creadores findAll con filters
- Endpoint de proyectos destacados + user destacados (tops)
- Endpoint: api/user/notifications (GET, Last check: date + pagination + default entre 5 y 10 not>
- Endpoint: api/creator/:id
- Endpoint: api/projects (GET ?userId ?projectId ?relatedProjectsId)
- Endpoint: api/applauses (GET ?userId ?projectId)
- Endpoint: api/comments (GET ?userId  ?projectId paginated)
- Endpoint: api/projects
- Dashboard que sirvan realmente las analíticas y que no sea por poner algo
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
  await app.register(fastifyHelmet);
  await app.register(fastifyMultipart);

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
  }

  await app.listen(process.env.GATEWAY_PORT ?? 5000, '0.0.0.0');
})();

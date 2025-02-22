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

/*
- FIX LOCAL-CONFIG.MODULE, CARGA SERVICE-SPECIFIC
93 Backend
94 - Top 10 mas ovaciónnados
95 - Busqueda de creadores findAll con filters
96 - Endpoint de proyectos destacados
97 - Endpoint: api/user/notifications (GET, Last check: date + pagination + default entre 5 y 10 not>
98 - Endpoint: api/favorites (GET, ?type="creators”|”projects” + pagination(futuro) + id usuarios )
99 - Endpoint: api/creator/:id
100 - Endpoint: api/projects (GET ?userId ?projectId ?relatedProjectsId)
101 - Endpoint: api/claps (GET ?userId ?projectId)
102 - Endpoint: api/comments (GET ?userId  ?projectId paginated)
103 - Endpoint: api/categories (GET)
104 - Endpoint: api/projects (POST batch)
105
106
107
108 Para hablar:
109 - Dashboard que sirvan realmente las analíticas y que no sea por poner algo (se había hablado alg>
110 - Estrategia de aplausos
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

  await app.listen(process.env.GATEWAY_PORT ?? 3000, '0.0.0.0');
})();

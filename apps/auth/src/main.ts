import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import { AuthModule } from './auth.module';
import { IS_DEVELOPMENT } from '@unaplauso/common/validation';

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);
  app.setGlobalPrefix('api/auth');

  if (!IS_DEVELOPMENT) app.set('trust proxy', 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  await app.listen(process.env.AUTH_PORT ?? 5001);
})();

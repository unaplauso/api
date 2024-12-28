import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';
import { AuthModule } from './auth.module';

(async () => {
  const app = await NestFactory.create(AuthModule);
  app.setGlobalPrefix('api/auth');

  app.use(
    session({
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
    }),
  );

  await app.listen(process.env.AUTH_PORT ?? 3001);
})();

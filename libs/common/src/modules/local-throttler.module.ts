import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerOptions,
} from '@nestjs/throttler';
import { IS_DEVELOPMENT } from '../validation';

export const GlobalThrottlerProvider: Provider = {
  provide: APP_GUARD,
  useClass: ThrottlerGuard,
};

export const LocalThrottlerModule = (op?: Partial<ThrottlerOptions>) =>
  ThrottlerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      throttlers: [
        {
          skipIf: () => IS_DEVELOPMENT,
          ttl: 10000,
          limit: 15,
          blockDuration: 3000,
          ...op,
        },
        {
          skipIf: () => IS_DEVELOPMENT,
          ttl: 30000,
          limit: 75,
          blockDuration: 180000,
        },
      ],
      storage: new ThrottlerStorageRedisService({
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        password: config.get('REDIS_PASSWORD'),
      }),
    }),
  });

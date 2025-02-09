import { createKeyv } from '@keyv/redis';
import { CacheModule, CacheOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const LocalCacheModule = (op?: CacheOptions) =>
  CacheModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    isGlobal: true,
    useFactory: async (config: ConfigService) => ({
      ttl: 60000,
      stores: [
        createKeyv({
          password: config.get('REDIS_PASSWORD'),
          socket: {
            host: config.get('REDIS_HOST', '127.0.0.1'),
            port: config.get<number>('REDIS_PORT', 6379),
          },
        }),
      ],
      ...op,
    }),
  });

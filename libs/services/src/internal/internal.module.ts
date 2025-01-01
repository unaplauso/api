import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InternalService } from './internal.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'REDIS_CLIENT',
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
            password: configService.get('REDIS_PASSWORD'),
          },
        }),
      },
    ]),
  ],
  providers: [InternalService],
  exports: [InternalService],
})
export class InternalModule {}

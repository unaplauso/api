import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InternalService } from './internal.service';

@Global()
@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				name: 'REDIS_MS_CLIENT',
				inject: [ConfigService],
				useFactory: async (config: ConfigService) => ({
					transport: Transport.REDIS,
					options: {
						host: config.get('REDIS_HOST'),
						port: config.get('REDIS_PORT'),
						password: config.get('REDIS_PASSWORD'),
					},
				}),
			},
		]),
	],
	providers: [InternalService],
	exports: [InternalService],
})
export class InternalModule {}

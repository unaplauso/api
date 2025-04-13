import { Module } from '@nestjs/common';
import { minutes, seconds } from '@nestjs/throttler';
import {
	LocalCacheModule,
	LocalConfigModule,
	LocalJwtModule,
	LocalThrottlerModule,
} from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database/module';
import { MercadoPagoService } from '@unaplauso/integrations/mercado-pago';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MercadoPagoController } from './mercado-pago.controller';
import { DiscordStrategy } from './strategies/discord.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { XStrategy } from './strategies/x.strategy';

@Module({
	imports: [
		LocalConfigModule(),
		LocalCacheModule({ ttl: seconds(60) }),
		DatabaseModule,
		LocalJwtModule(),
		LocalThrottlerModule({ blockDuration: minutes(30) }),
	],
	controllers: [AuthController, MercadoPagoController],
	providers: [
		AuthService,
		MercadoPagoService,
		GoogleStrategy,
		XStrategy,
		FacebookStrategy,
		DiscordStrategy,
		GithubStrategy,
	],
})
export class AuthModule {}

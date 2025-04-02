import { Module } from '@nestjs/common';
import { minutes, seconds } from '@nestjs/throttler';
import {
	LocalCacheModule,
	LocalConfigModule,
	LocalJwtModule,
	LocalThrottlerModule,
} from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database/module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DiscordStrategy } from './strategies/discord.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { XStrategy } from './strategies/x.strategy';
import { MercadoPagoController } from './mercado-pago.controller';

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
		GoogleStrategy,
		XStrategy,
		FacebookStrategy,
		DiscordStrategy,
		GithubStrategy,
	],
})
export class AuthModule {}

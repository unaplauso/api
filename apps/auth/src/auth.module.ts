import { Module } from '@nestjs/common';
import {
  LocalCacheModule,
  LocalConfigModule,
  LocalJwtModule,
  LocalThrottlerModule,
} from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DiscordStrategy } from './strategies/discord.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { XStrategy } from './strategies/x.strategy';

@Module({
  imports: [
    LocalConfigModule(),
    LocalCacheModule(),
    DatabaseModule,
    LocalJwtModule(),
    LocalThrottlerModule({ blockDuration: 30 * 60000 }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    XStrategy,
    FacebookStrategy,
    DiscordStrategy,
  ],
})
export class AuthModule {}

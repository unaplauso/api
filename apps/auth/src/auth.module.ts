import { Module } from '@nestjs/common';
import {
  LocalCacheModule,
  LocalConfigModule,
  LocalJwtModule,
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
    LocalCacheModule({ ttl: 2592000000 }), // 30d
    DatabaseModule,
    LocalJwtModule,
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

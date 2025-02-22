import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { IS_DEVELOPMENT } from '../validation';

export const LocalJwtModule = (op?: JwtModuleOptions) =>
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (config: ConfigService) => ({
      global: true,
      secret: config.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: IS_DEVELOPMENT ? '1y' : '1h',
      },
      ...op,
    }),
    inject: [ConfigService],
  });

import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

export const LocalJwtModule = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => ({
    global: true,
    secret: config.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: process.env.NODE_ENV === 'production' ? '1h' : '1y',
    },
  }),
  inject: [ConfigService],
});

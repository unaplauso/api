import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';

export const LocalConfigModule = (override?: ConfigModuleOptions) =>
  ConfigModule.forRoot({ isGlobal: true, cache: true, ...override });

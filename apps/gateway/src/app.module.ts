import { Module } from '@nestjs/common';
import {
  GlobalThrottlerProvider,
  LocalConfigModule,
  LocalJwtModule,
  LocalThrottlerModule,
} from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database';
import { InternalModule } from '@unaplauso/services';
import { HealthController } from './controllers/health.controller';
import { ReportController } from './controllers/report.controller';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [
    LocalConfigModule(),
    InternalModule,
    DatabaseModule,
    LocalJwtModule(),
    LocalThrottlerModule(),
  ],
  providers: [GlobalThrottlerProvider],
  controllers: [HealthController, ReportController, UserController],
})
export class AppModule {}

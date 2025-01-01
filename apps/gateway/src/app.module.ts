import { Module } from '@nestjs/common';
import { LocalConfigModule, LocalJwtModule } from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database';
import { InternalModule } from '@unaplauso/services';
import { HealthController } from './controllers/health.controller';
import { ReportController } from './controllers/report.controller';

@Module({
  imports: [
    LocalConfigModule(),
    InternalModule,
    DatabaseModule,
    LocalJwtModule,
  ],
  controllers: [HealthController, ReportController],
})
export class AppModule {}

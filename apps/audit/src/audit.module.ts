import { Module } from '@nestjs/common';
import { LocalConfigModule } from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database/module';
import { AuditController } from './audit.controller';
import { FavoriteService } from './services/favorite.service';
import { ReportService } from './services/report.service';

@Module({
  imports: [LocalConfigModule(), DatabaseModule],
  controllers: [AuditController],
  providers: [ReportService, FavoriteService],
})
export class AuditModule {}

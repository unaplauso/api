import { Module } from '@nestjs/common';
import { DatabaseModule } from '@unaplauso/database';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { LocalConfigModule } from '@unaplauso/common/modules';

@Module({
  imports: [LocalConfigModule(), DatabaseModule],
  controllers: [AuditController],
  providers: [AuditService],
})
export class AuditModule {}

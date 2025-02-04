import { Controller } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { UserAction } from '@unaplauso/common/validation';
import { InsertReport } from '@unaplauso/database';
import { AuditService } from './audit.service';
import { Pattern } from './decorators/pattern.decorator';

@Controller()
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Pattern('health_check')
  async healthCheck() {
    return this.service.healthCheck();
  }

  @Pattern('create_report')
  async createReport(@Payload() dto: UserAction<InsertReport>) {
    return this.service.createReport(dto);
  }

  @Pattern('read_report')
  async readReport() {
    return this.service.readReport();
  }

  @Pattern('delete_report')
  async deleteReport(
    @Payload() { userId, reportedId }: { userId: number; reportedId: number },
  ) {
    return this.service.deleteReport(userId, reportedId);
  }
}

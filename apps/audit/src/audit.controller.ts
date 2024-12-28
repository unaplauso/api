import { Controller } from '@nestjs/common';
import { Pattern, Service } from '@unaplauso/services';
import { AppService } from './audit.service';

@Controller()
export class AuditController {
  constructor(private readonly service: AppService) {}

  @Pattern(Service.AUDIT, 'health-check')
  healthCheck() {
    return this.service.healthCheck();
  }
}

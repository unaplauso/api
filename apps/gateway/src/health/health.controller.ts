import { Controller, Get, Param } from '@nestjs/common';
import { Service } from '@unaplauso/services';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  healthCheck() {
    return this.healthService.healthCheck();
  }

  @Get(':id')
  serviceHealthCheck(@Param('id') id: Service) {
    return this.healthService.healthCheck(id);
  }
}

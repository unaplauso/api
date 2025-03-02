import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { NoContent } from '@unaplauso/common/decorators';
import { InjectDB } from '@unaplauso/database';
import { InjectClient, InternalService, Service } from '@unaplauso/services';
import { serviceExists } from '@unaplauso/services/utils';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDB() private readonly db: NodePgDatabase,
    @InjectClient() private readonly client: InternalService,
  ) {}

  @NoContent()
  @Get()
  async healthCheck() {
    return true;
  }

  @NoContent()
  @Get(':id')
  async serviceHealthCheck(@Param('id') id: string) {
    if (id === 'db') return this.db.execute('SELECT 1');
    if (!serviceExists(id)) throw new NotFoundException();
    return this.client.send(id as Service, 'health_check');
  }
}

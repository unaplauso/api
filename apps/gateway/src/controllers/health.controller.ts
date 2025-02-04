import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { InjectDB } from '@unaplauso/database';
import { InjectCLI, InternalService, Service } from '@unaplauso/services';
import { serviceExists } from '@unaplauso/services/utils';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { NoContent } from '../decorators/no-content.decorator';
import { SuperProtected } from '../decorators/super-protected.decorator';

@SuperProtected()
@Controller('health')
export class HealthController {
  constructor(
    @InjectDB() private readonly db: NodePgDatabase,
    @InjectCLI() private readonly client: InternalService,
  ) {}

  @NoContent()
  @Get()
  async healthCheck() {
    return 'OK';
  }

  @NoContent()
  @Get(':id')
  async serviceHealthCheck(@Param('id') id: Service | 'db') {
    if (id === 'db') return this.db.execute('SELECT 1');
    if (!serviceExists(id)) throw new NotFoundException();
    return this.client.send(id, 'health_check');
  }
}

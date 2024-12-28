import {
  Inject,
  Injectable,
  PreconditionFailedException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '@unaplauso/database';
import { InternalService, Service } from '@unaplauso/services';
import { serviceExists } from '@unaplauso/services/utils';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class HealthService {
  constructor(
    @Inject(InternalService) private client: InternalService,
    @Inject(DATABASE_CONNECTION) private readonly database: NodePgDatabase,
  ) {}

  healthCheck(id?: Service | 'db') {
    if (!id) return 'OK';
    if (id === 'db') return this.database.execute('SELECT 1');
    if (!serviceExists(id)) throw new PreconditionFailedException();
    return this.client.send(id, 'health-check');
  }
}

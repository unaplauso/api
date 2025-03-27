import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { NoContent } from '@unaplauso/common/decorators';
import { type Database, InjectDB } from '@unaplauso/database/module';
import {
	InjectClient,
	type InternalService,
	type Service,
} from '@unaplauso/services';
import { serviceExists } from '@unaplauso/services/utils';

@Controller('health')
export class HealthController {
	constructor(
		@InjectDB() private readonly db: Database,
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

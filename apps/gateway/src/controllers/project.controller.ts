import type { Cache } from '@nestjs/cache-manager';
import { Controller, Delete, Get, Query } from '@nestjs/common';
import { InjectCache, NoContent, UseCache } from '@unaplauso/common/decorators';
import {
	InjectClient,
	type InternalService,
	Service,
} from '@unaplauso/services';
import { IdParam, Validate } from '@unaplauso/validation';
import {
	ListProjectSchema,
	type TListProject,
} from '@unaplauso/validation/types';
import { JwtProtected } from '../decorators/jwt-protected.decorator';
import { UserId } from '../decorators/user-id.decorator';

@Controller('project')
export class ProjectController {
	constructor(
		@InjectClient() private readonly client: InternalService,
		@InjectCache() private readonly cache: Cache,
	) {}

	/** // TODO:
	 * createProject -> jwtprotected, cubrir todo
	 * readProject/:id -> + eventservice project_read, payload id: number
	 * updateProject/:id -> jwtprotected, cubrir todo
	 */

	@JwtProtected()
	@NoContent()
	@Delete(':id')
	async deleteProject(@UserId() userId: number, @IdParam() projectId: number) {
		return this.client.send(Service.AUDIT, 'delete_project', {
			userId,
			projectId,
		});
	}

	@Validate('query', ListProjectSchema)
	@UseCache()
	@Get()
	async listProject(@Query() dto: TListProject) {
		if (
			dto.finished === undefined &&
			dto.page === 1 &&
			dto.pageSize === 10 &&
			dto.orderBy === 'interactions' &&
			dto.order === 'desc'
		)
			return this.cache.get('top_project');

		return this.client.send(Service.OPEN, 'list_project', dto);
	}
}

import type { Cache } from '@nestjs/cache-manager';
import {
	Body,
	Controller,
	Delete,
	Get,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { InjectCache, NoContent, UseCache } from '@unaplauso/common/decorators';
import {
	InjectClient,
	type InternalService,
	Service,
} from '@unaplauso/services';
import { IdParam, Validate } from '@unaplauso/validation';
import {
	CreateProjectSchema,
	ListProjectSchema,
	type TCreateProject,
	type TListProject,
	type TUpdateProject,
	UpdateProjectSchema,
} from '@unaplauso/validation/types';
import { firstValueFrom } from 'rxjs';
import { JwtProtected } from '../decorators/jwt-protected.decorator';
import { UserId } from '../decorators/user-id.decorator';

@Controller('project')
export class ProjectController {
	constructor(
		@InjectClient() private readonly client: InternalService,
		@InjectCache() private readonly cache: Cache,
	) {}

	@JwtProtected()
	@NoContent()
	@Validate('body', CreateProjectSchema)
	@Post()
	async createProject(@UserId() userId: number, @Body() dto: TCreateProject) {
		return this.client.send(Service.AUDIT, 'create_project', {
			userId,
			...dto,
		});
	}

	@UseCache()
	@Get(':id')
	async readProject(@IdParam() id: number) {
		this.client.emit(Service.EVENT, 'project_read', id);
		return this.client.send(Service.OPEN, 'read_project', id);
	}

	@JwtProtected()
	@NoContent()
	@Validate('body', UpdateProjectSchema)
	@Patch()
	async updateProject(@UserId() userId: number, @Body() dto: TUpdateProject) {
		return this.client.send(Service.AUDIT, 'update_project', {
			userId,
			...dto,
		});
	}

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
			dto.status === undefined &&
			!dto.creatorId &&
			dto.page === 1 &&
			dto.pageSize === 10 &&
			dto.orderBy === 'interactions' &&
			dto.order === 'desc'
		) {
			const cached = await this.cache.get('project_top_10');
			if (cached) return cached;

			const value = await firstValueFrom(
				await this.client.send(Service.OPEN, 'list_project', dto),
			);

			return this.cache.set('project_top_10', value);
		}

		return this.client.send(Service.OPEN, 'list_project', dto);
	}
}

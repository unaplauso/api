import { Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { NoContent, UseCache, UserId } from '@unaplauso/common/decorators';
import {
	InjectClient,
	type InternalService,
	Service,
} from '@unaplauso/services';
import { IdParam, Validate } from '@unaplauso/validation';
import {
	PaginationSchema,
	type TPagination,
} from '@unaplauso/validation/types';
import * as v from 'valibot';
import { JwtProtected } from '../decorators/jwt-protected.decorator';

@Controller('favorite')
export class FavoriteController {
	constructor(@InjectClient() private readonly client: InternalService) {}

	@JwtProtected()
	@NoContent()
	@Post('creator/:id')
	async createFavoriteCreator(
		@UserId() userId: number,
		@IdParam() creatorId: number,
	) {
		return this.client.send(Service.AUDIT, 'create_favorite_creator', {
			userId,
			creatorId,
		});
	}

	@JwtProtected()
	@NoContent()
	@Delete('creator/:id')
	async deleteFavoriteCreator(
		@UserId() userId: number,
		@IdParam() creatorId: number,
	) {
		return this.client.send(Service.AUDIT, 'delete_favorite_creator', {
			userId,
			creatorId,
		});
	}

	@Validate('query', v.omit(PaginationSchema, ['order', 'search']))
	@UseCache()
	@Get(':id/creator')
	async listCreatorFavoriteCreator(
		@IdParam() creatorId: number,
		@Query() pagination: Omit<TPagination, 'order' | 'search'>,
	) {
		return this.client.send(Service.AUDIT, 'list_favorite_creator', {
			...pagination,
			userId: creatorId,
		});
	}

	@JwtProtected()
	@Validate('query', v.omit(PaginationSchema, ['order', 'search']))
	@Get('creator')
	async listFavoriteCreator(
		@UserId() userId: number,
		@Query() pagination: Omit<TPagination, 'order' | 'search'>,
	) {
		return this.client.send(Service.AUDIT, 'list_favorite_creator', {
			...pagination,
			userId,
		});
	}

	@JwtProtected()
	@NoContent()
	@Post('project/:id')
	async createFavoriteProject(
		@UserId() userId: number,
		@IdParam() projectId: number,
	) {
		return this.client.send(Service.AUDIT, 'create_favorite_project', {
			userId,
			projectId,
		});
	}

	@JwtProtected()
	@NoContent()
	@Delete('project/:id')
	async deleteFavoriteProject(
		@UserId() userId: number,
		@IdParam() projectId: number,
	) {
		return this.client.send(Service.AUDIT, 'delete_favorite_project', {
			userId,
			projectId,
		});
	}

	@Validate('query', v.omit(PaginationSchema, ['order', 'search']))
	@UseCache()
	@Get(':id/project')
	async listCreatorFavoriteProject(
		@IdParam() creatorId: number,
		@Query() pagination: TPagination,
	) {
		return this.client.send(Service.AUDIT, 'list_favorite_project', {
			...pagination,
			userId: creatorId,
		});
	}

	@JwtProtected()
	@Validate('query', v.omit(PaginationSchema, ['order', 'search']))
	@Get('project')
	async listFavoriteProject(
		@UserId() userId: number,
		@Query() pagination: TPagination,
	) {
		return this.client.send(Service.AUDIT, 'list_favorite_project', {
			...pagination,
			userId,
		});
	}
}

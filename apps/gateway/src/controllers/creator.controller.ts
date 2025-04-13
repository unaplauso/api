import type { Cache } from '@nestjs/cache-manager';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { InjectCache, UseCache } from '@unaplauso/common/decorators';
import {
	InjectClient,
	type InternalService,
	Service,
} from '@unaplauso/services';
import { Validate, ValidateParam } from '@unaplauso/validation';
import {
	type ListCreator,
	ListCreatorSchema,
} from '@unaplauso/validation/types';
import {
	USERNAME_REGEX,
	isDefaultType,
	vStringInt,
} from '@unaplauso/validation/utils';
import * as v from 'valibot';

@Controller('creator')
export class CreatorController {
	constructor(
		@InjectClient() private readonly client: InternalService,
		@InjectCache() private readonly cache: Cache,
	) {}

	@ValidateParam(
		'id',
		v.union([v.pipe(v.string(), v.regex(USERNAME_REGEX)), vStringInt]),
	)
	@Get(':id')
	async readCreator(@Param('id') idOrUsername: string | number) {
		this.client.emit(Service.EVENT, 'creator_read', idOrUsername);
		return this.client.send(Service.OPEN, 'read_creator', idOrUsername);
	}

	@Validate('query', ListCreatorSchema)
	@UseCache()
	@Get()
	async listCreator(@Query() dto: ListCreator) {
		if (isDefaultType(ListCreatorSchema, dto)) {
			const cached = await this.cache.get('top_creator');
			if (cached) return cached;
			this.client.emit(Service.EVENT, 'refresh_top_creator', false);
		}

		return this.client.send(Service.OPEN, 'list_creator', dto);
	}
}

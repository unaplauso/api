import { Controller, Get, Query } from '@nestjs/common';
import { UseCache } from '@unaplauso/common/decorators';
import {
	InjectClient,
	type InternalService,
	Service,
} from '@unaplauso/services';
import { Validate } from '@unaplauso/validation';
import { type Pagination, PaginationSchema } from '@unaplauso/validation/types';
import * as v from 'valibot';

@Controller('topic')
export class TopicController {
	constructor(@InjectClient() private readonly client: InternalService) {}

	@Validate('query', v.omit(PaginationSchema, ['order']))
	@UseCache()
	@Get()
	async listTopic(@Query() dto: Omit<Pagination, 'order'>) {
		return this.client.send(Service.OPEN, 'list_topic', dto);
	}
}

import { Controller, Get, Query } from '@nestjs/common';
import {
  DefaultPaginationSchema,
  Pagination,
} from '@unaplauso/common/pagination';
import { Validate } from '@unaplauso/common/validation';
import { InjectClient, InternalService, Service } from '@unaplauso/services';

@Controller('topic')
export class TopicController {
  constructor(@InjectClient() private readonly client: InternalService) {}

  @Validate('query', DefaultPaginationSchema)
  @Get()
  async listTopic(@Query() pagination: Pagination) {
    return this.client.send(Service.OPEN, 'list_topic', pagination);
  }
}

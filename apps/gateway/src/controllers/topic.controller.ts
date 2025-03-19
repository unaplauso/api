import { Controller, Get, Query } from '@nestjs/common';
import { InjectClient, InternalService, Service } from '@unaplauso/services';
import { Validate } from '@unaplauso/validation';
import { Pagination, PaginationSchema } from '@unaplauso/validation/dtos';
import { omit } from 'valibot';

@Controller('topic')
export class TopicController {
  constructor(@InjectClient() private readonly client: InternalService) {}

  @Validate('query', omit(PaginationSchema, ['order']))
  @Get()
  async listTopic(@Query() dto: Omit<Pagination, 'order'>) {
    return this.client.send(Service.OPEN, 'list_topic', dto);
  }
}

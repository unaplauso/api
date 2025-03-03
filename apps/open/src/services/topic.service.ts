import { Injectable } from '@nestjs/common';
import { Pagination, withPagination } from '@unaplauso/common/pagination';
import { InjectDB, TopicTable } from '@unaplauso/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class TopicService {
  constructor(@InjectDB() private readonly db: NodePgDatabase) {}

  async listTopic(pagination: Pagination) {
    return withPagination(
      TopicTable.name,
      pagination,
      this.db.select().from(TopicTable).$dynamic(),
    );
  }
}

import { Injectable } from '@nestjs/common';
import {
  PaginationWithSearch,
  withPagination,
} from '@unaplauso/common/pagination';
import { InjectDB, TopicTable } from '@unaplauso/database';
import { lower, wordSimilarity } from '@unaplauso/database/utils';
import { gte, like } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class TopicService {
  constructor(@InjectDB() private readonly db: NodePgDatabase) {}

  async listTopic(dto: PaginationWithSearch) {
    const considerTrgm = Boolean(dto.search?.length ?? 0 >= 3);

    return withPagination(
      considerTrgm
        ? wordSimilarity(TopicTable.aliases, dto.search as string)
        : TopicTable.name,
      { ...dto, order: considerTrgm ? 'desc' : 'asc' },
      this.db
        .select({ id: TopicTable.id, name: TopicTable.name })
        .from(TopicTable)
        .where(
          considerTrgm
            ? gte(wordSimilarity(TopicTable.aliases, dto.search as string), 0.4)
            : dto.search
              ? like(lower(TopicTable.name), `%${dto.search.toLowerCase()}%`)
              : undefined,
        )
        .$dynamic(),
    );
  }
}

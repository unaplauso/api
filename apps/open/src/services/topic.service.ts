import { Injectable } from '@nestjs/common';
import { TopicTable } from '@unaplauso/database';
import { wordSimilarity } from '@unaplauso/database/functions';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { TPagination } from '@unaplauso/validation/types';
import { asc, desc, gte } from 'drizzle-orm';

@Injectable()
export class TopicService {
	constructor(@InjectDB() private readonly db: Database) {}

	async listTopic(dto: Omit<TPagination, 'order'>) {
		return this.db
			.select({ id: TopicTable.id, name: TopicTable.name })
			.from(TopicTable)
			.where(
				dto.search
					? gte(
							wordSimilarity(TopicTable.aliases, dto.search),
							Math.min(Math.exp(dto.search.length * 0.1) * 0.275, 0.7),
						)
					: undefined,
			)
			.orderBy(
				...(dto.search
					? [
							desc(wordSimilarity(TopicTable.aliases, dto.search)),
							desc(wordSimilarity(TopicTable.name, dto.search)),
						]
					: [asc(TopicTable.name)]),
			)
			.limit(dto.pageSize)
			.offset((dto.page - 1) * dto.pageSize);
	}
}

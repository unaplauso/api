import { Injectable } from '@nestjs/common';
import {
  FavoriteCreatorTable,
  FavoriteProjectTable,
  TopicTable,
  UserTable,
  UserTopicTable,
} from '@unaplauso/database';
import {
  coalesce,
  jsonAgg,
  jsonBuildObject,
  sqlJsonArray,
} from '@unaplauso/database/functions';
import { Database, InjectDB } from '@unaplauso/database/module';
import { Pagination } from '@unaplauso/validation/dtos';
import { and, desc, eq, isNotNull, sql } from 'drizzle-orm';

@Injectable()
export class FavoriteService {
  constructor(@InjectDB() private readonly db: Database) {}

  async createFavoriteCreator(userId: number, creatorId: number) {
    return this.db
      .insert(FavoriteCreatorTable)
      .values({ userId, creatorId })
      .onConflictDoNothing();
  }

  async deleteFavoriteCreator(userId: number, creatorId: number) {
    return this.db
      .delete(FavoriteCreatorTable)
      .where(
        and(
          eq(FavoriteCreatorTable.userId, userId),
          eq(FavoriteCreatorTable.creatorId, creatorId),
        ),
      );
  }

  readFavoriteCreatorQuery = this.db
    .select({
      id: UserTable.id,
      favoritedAt: FavoriteCreatorTable.createdAt,
      displayName: UserTable.displayName,
      username: UserTable.username,
      profilePicFileId: UserTable.profilePicFileId,
      profileBannerFileId: UserTable.profileBannerFileId,
      topics: coalesce(
        jsonAgg(
          jsonBuildObject({ id: TopicTable.id, name: TopicTable.name }),
          isNotNull(TopicTable.id),
        ),
        sqlJsonArray,
      ),
    })
    .from(FavoriteCreatorTable)
    .innerJoin(UserTable, eq(UserTable.id, FavoriteCreatorTable.creatorId))
    .leftJoin(UserTopicTable, eq(UserTopicTable.userId, UserTable.id))
    .leftJoin(TopicTable, eq(TopicTable.id, UserTopicTable.topicId))
    .where(eq(FavoriteCreatorTable.userId, sql.placeholder('userId')))
    .groupBy(UserTable.id, FavoriteCreatorTable.createdAt)
    .orderBy(desc(FavoriteCreatorTable.createdAt))
    .limit(sql.placeholder('limit'))
    .offset(sql.placeholder('offset'))
    .prepare('read_favorite_creator_query');

  async readFavoriteCreator(
    userId: number,
    dto: Omit<Pagination, 'order' | 'search'>,
  ) {
    return this.readFavoriteCreatorQuery.execute({
      userId,
      limit: dto.pageSize,
      offset: (dto.page - 1) * dto.pageSize,
    });
  }

  async createFavoriteProject(userId: number, projectId: number) {
    return this.db
      .insert(FavoriteProjectTable)
      .values({ userId, projectId })
      .onConflictDoNothing();
  }

  async deleteFavoriteProject(userId: number, projectId: number) {
    return this.db
      .delete(FavoriteProjectTable)
      .where(
        and(
          eq(FavoriteProjectTable.userId, userId),
          eq(FavoriteProjectTable.projectId, projectId),
        ),
      );
  }

  async readFavoriteProject(
    id: number,
    dto: Omit<Pagination, 'order' | 'search'>,
  ) {
    return { id, dto };
  }
}

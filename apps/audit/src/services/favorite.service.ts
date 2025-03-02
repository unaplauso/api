import { Injectable } from '@nestjs/common';
import { Pagination, withPagination } from '@unaplauso/common/pagination';
import {
  FavoriteCreatorTable,
  FavoriteProjectTable,
  InjectDB,
} from '@unaplauso/database';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class FavoriteService {
  constructor(@InjectDB() private readonly db: NodePgDatabase) {}

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

  async readFavoriteCreator(id: number, pagination: Pagination) {
    return withPagination(
      FavoriteCreatorTable.createdAt,
      pagination,
      this.db
        .select({ creatorId: FavoriteCreatorTable.creatorId })
        .from(FavoriteCreatorTable)
        .where(eq(FavoriteCreatorTable.userId, id))
        .$dynamic(),
    );
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

  async readFavoriteProject(id: number, pagination: Pagination) {
    return withPagination(
      FavoriteProjectTable.createdAt,
      pagination,
      this.db
        .select({ creatorId: FavoriteProjectTable.projectId })
        .from(FavoriteProjectTable)
        .where(eq(FavoriteProjectTable.userId, id))
        .$dynamic(),
    );
  }
}

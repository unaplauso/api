import { Controller } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { InsertReportCreator, InsertReportProject } from '@unaplauso/database';
import { NoContent } from '@unaplauso/services';
import {
  UserToCreatorAction,
  UserToProjectAction,
} from '@unaplauso/validation';
import { Pagination } from '@unaplauso/validation/dtos';
import { Pattern } from './decorators/pattern.decorator';
import { FavoriteService } from './services/favorite.service';
import { ReportService } from './services/report.service';

@Controller()
export class AuditController {
  constructor(
    private readonly report: ReportService,
    private readonly favorite: FavoriteService,
  ) {}

  @NoContent()
  @Pattern('health_check')
  async healthCheck() {
    return true;
  }

  @NoContent()
  @Pattern('create_report_creator')
  async createReportCreator(
    @Payload() dto: UserToCreatorAction<InsertReportCreator>,
  ) {
    return this.report.createReportCreator(dto);
  }

  @NoContent()
  @Pattern('create_report_project')
  async createReportProject(
    @Payload() dto: UserToProjectAction<InsertReportProject>,
  ) {
    return this.report.createReportProject(dto);
  }

  @NoContent()
  @Pattern('create_favorite_creator')
  async createFavoriteCreator(
    @Payload() { userId, creatorId }: { userId: number; creatorId: number },
  ) {
    return this.favorite.createFavoriteCreator(userId, creatorId);
  }

  @NoContent()
  @Pattern('delete_favorite_creator')
  async deleteFavoriteCreator(
    @Payload() { userId, creatorId }: { userId: number; creatorId: number },
  ) {
    return this.favorite.deleteFavoriteCreator(userId, creatorId);
  }

  @Pattern('list_favorite_creator')
  async listFavoriteCreator(
    @Payload()
    dto: {
      userId: number;
      pagination: Omit<Pagination, 'order' | 'search'>;
    },
  ) {
    return this.favorite.readFavoriteCreator(dto.userId, dto.pagination);
  }

  @NoContent()
  @Pattern('create_favorite_project')
  async createFavoriteProject(
    @Payload() { userId, projectId }: { userId: number; projectId: number },
  ) {
    return this.favorite.createFavoriteProject(userId, projectId);
  }

  @NoContent()
  @Pattern('delete_favorite_project')
  async deleteFavoriteProject(
    @Payload() { userId, projectId }: { userId: number; projectId: number },
  ) {
    return this.favorite.deleteFavoriteProject(userId, projectId);
  }

  @Pattern('list_favorite_project')
  async listFavoriteProject(
    @Payload()
    dto: {
      userId: number;
      pagination: Omit<Pagination, 'order' | 'search'>;
    },
  ) {
    return this.favorite.readFavoriteProject(dto.userId, dto.pagination);
  }
}

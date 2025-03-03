import { Controller } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { WithPagination } from '@unaplauso/common/pagination';
import {
  UserToCreatorAction,
  UserToProjectAction,
} from '@unaplauso/common/validation';
import { InsertReportCreator, InsertReportProject } from '@unaplauso/database';
import { Pattern } from './decorators/pattern.decorator';
import { FavoriteService } from './services/favorite.service';
import { ReportService } from './services/report.service';

@Controller()
export class AuditController {
  constructor(
    private readonly report: ReportService,
    private readonly favorite: FavoriteService,
  ) {}

  @Pattern('health_check')
  async healthCheck() {
    return true;
  }

  @Pattern('create_report_creator')
  async createReportCreator(
    @Payload() dto: UserToCreatorAction<InsertReportCreator>,
  ) {
    return this.report.createReportCreator(dto);
  }

  @Pattern('create_report_project')
  async createReportProject(
    @Payload() dto: UserToProjectAction<InsertReportProject>,
  ) {
    return this.report.createReportProject(dto);
  }

  @Pattern('create_favorite_creator')
  async createFavoriteCreator(
    @Payload() { userId, creatorId }: { userId: number; creatorId: number },
  ) {
    return this.favorite.createFavoriteCreator(userId, creatorId);
  }

  @Pattern('delete_favorite_creator')
  async deleteFavoriteCreator(
    @Payload() { userId, creatorId }: { userId: number; creatorId: number },
  ) {
    return this.favorite.deleteFavoriteCreator(userId, creatorId);
  }

  @Pattern('list_favorite_creator')
  async listFavoriteCreator(
    @Payload()
    { userId, pagination }: WithPagination<{ userId: number }>,
  ) {
    return this.favorite.readFavoriteCreator(userId, pagination);
  }

  @Pattern('create_favorite_project')
  async createFavoriteProject(
    @Payload() { userId, projectId }: { userId: number; projectId: number },
  ) {
    return this.favorite.createFavoriteProject(userId, projectId);
  }

  @Pattern('delete_favorite_project')
  async deleteFavoriteProject(
    @Payload() { userId, projectId }: { userId: number; projectId: number },
  ) {
    return this.favorite.deleteFavoriteProject(userId, projectId);
  }

  @Pattern('list_favorite_project')
  async listFavoriteProject(
    @Payload()
    { userId, pagination }: WithPagination<{ userId: number }>,
  ) {
    return this.favorite.readFavoriteProject(userId, pagination);
  }
}

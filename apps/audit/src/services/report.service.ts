import { Injectable } from '@nestjs/common';
import {
  UserToCreatorAction,
  UserToProjectAction,
} from '@unaplauso/common/validation';
import {
  InjectDB,
  InsertReportCreator,
  ReportCreatorTable,
} from '@unaplauso/database';
import {
  InsertReportProject,
  ReportProjectTable,
} from '@unaplauso/database/schema/report-project.schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class ReportService {
  constructor(@InjectDB() private readonly db: NodePgDatabase) {}

  async createReportCreator(dto: UserToCreatorAction<InsertReportCreator>) {
    return this.db
      .insert(ReportCreatorTable)
      .values(dto)
      .onConflictDoUpdate({
        target: [ReportCreatorTable.userId, ReportCreatorTable.creatorId],
        set: { message: dto.message, reason: dto.reason },
      });
  }

  async createReportProject(dto: UserToProjectAction<InsertReportProject>) {
    return this.db
      .insert(ReportProjectTable)
      .values(dto)
      .onConflictDoUpdate({
        target: [ReportProjectTable.userId, ReportProjectTable.projectId],
        set: { message: dto.message, reason: dto.reason },
      });
  }
}

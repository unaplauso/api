import { Injectable } from '@nestjs/common';
import { UserAction } from '@unaplauso/common/validation';
import { InjectDB, InsertReport, ReportTable } from '@unaplauso/database';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class AuditService {
  constructor(@InjectDB() private readonly db: NodePgDatabase) {}

  async healthCheck() {
    return 'OK';
  }

  async createReport(dto: UserAction<InsertReport>) {
    return this.db.insert(ReportTable).values(dto);
  }

  async readReport() {
    return this.db.select().from(ReportTable);
  }

  async deleteReport(userId: number, reportedId: number) {
    return this.db
      .delete(ReportTable)
      .where(
        and(
          eq(ReportTable.userId, userId),
          eq(ReportTable.reportedId, reportedId),
        ),
      );
  }
}

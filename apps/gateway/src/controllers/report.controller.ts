import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { VBody } from '@unaplauso/common/validation';
import { InsertReport, InsertReportSchema } from '@unaplauso/database';
import { InjectCLI, InternalService, Service } from '@unaplauso/services';
import { JwtProtected } from '../decorators/jwt-protected.decorator';
import { NoContent } from '../decorators/no-content.decorator';
import { SuperProtected } from '../decorators/super-protected.decorator';
import { UserId } from '../decorators/user-id.decorator';

@Controller('report')
export class ReportController {
  constructor(@InjectCLI() private readonly client: InternalService) {}

  @JwtProtected()
  @NoContent()
  @Post()
  async createReport(
    @UserId() userId: number,
    @VBody(InsertReportSchema) dto: InsertReport,
  ) {
    return this.client.send(Service.AUDIT, 'create_report', { ...dto, userId });
  }

  @SuperProtected()
  @Get()
  async readReport() {
    return this.client.send(Service.AUDIT, 'read_report');
  }

  @SuperProtected()
  @NoContent()
  @Delete(':userId/:reportedId')
  async deleteReport(
    @Param('userId') userId: string,
    @Param('reportedId') reportedId: string,
  ) {
    return this.client.send(Service.AUDIT, 'delete_report', {
      userId,
      reportedId,
    });
  }
}

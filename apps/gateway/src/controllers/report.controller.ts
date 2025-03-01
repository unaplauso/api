import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { NoContent } from '@unaplauso/common/decorators';
import { Validate } from '@unaplauso/common/validation';
import { InsertReport, InsertReportSchema } from '@unaplauso/database';
import { InjectClient, InternalService, Service } from '@unaplauso/services';
import { JwtProtected } from '../decorators/jwt-protected.decorator';
import { SuperProtected } from '../decorators/super-protected.decorator';
import { UserId } from '../decorators/user-id.decorator';

@Controller('report')
export class ReportController {
  constructor(@InjectClient() private readonly client: InternalService) {}

  @JwtProtected()
  @NoContent()
  @Validate('body', InsertReportSchema)
  @Post()
  async createReport(@UserId() userId: number, @Body() dto: InsertReport) {
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

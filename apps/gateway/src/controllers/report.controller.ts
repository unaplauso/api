import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { NoContent } from '@unaplauso/common/decorators';
import { Validate } from '@unaplauso/common/validation';
import {
  InsertReportCreator,
  InsertReportCreatorSchema,
  InsertReportProject,
  InsertReportProjectSchema,
} from '@unaplauso/database';
import { InjectClient, InternalService, Service } from '@unaplauso/services';
import { JwtProtected } from '../decorators/jwt-protected.decorator';
import { UserId } from '../decorators/user-id.decorator';

@Controller('report')
export class ReportController {
  constructor(@InjectClient() private readonly client: InternalService) {}

  @JwtProtected()
  @NoContent()
  @Validate('body', InsertReportCreatorSchema)
  @Post('creator/:id')
  async createReportCreator(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) creatorId: number,
    @Body() dto: InsertReportCreator,
  ) {
    return this.client.send(Service.AUDIT, 'create_report_creator', {
      ...dto,
      userId,
      creatorId,
    });
  }

  @JwtProtected()
  @NoContent()
  @Validate('body', InsertReportProjectSchema)
  @Post('project/:id')
  async createReportProject(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) projectId: number,
    @Body() dto: InsertReportProject,
  ) {
    return this.client.send(Service.AUDIT, 'create_report_project', {
      ...dto,
      userId,
      projectId,
    });
  }
}

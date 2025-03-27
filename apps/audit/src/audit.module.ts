import { Module } from '@nestjs/common';
import { LocalConfigModule } from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database/module';
import { AuditController } from './audit.controller';
import { FavoriteService } from './services/favorite.service';
import { ProjectService } from './services/project.service';
import { ReportService } from './services/report.service';
import { UserService } from './services/user.service';

@Module({
	imports: [LocalConfigModule(), DatabaseModule],
	controllers: [AuditController],
	providers: [ReportService, FavoriteService, ProjectService, UserService],
})
export class AuditModule {}

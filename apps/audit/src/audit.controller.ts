import { Controller, Inject } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { NoContent } from '@unaplauso/common/decorators';
import type {
	UserAction,
	UserToCreatorAction,
	UserToProjectAction,
} from '@unaplauso/validation';
import type {
	TCreateReportCreator,
	TCreateReportProject,
	TPagination,
	TUpdateUser,
} from '@unaplauso/validation/types';
import { Pattern } from './decorators/pattern.decorator';
import { FavoriteService } from './services/favorite.service';
import { ProjectService } from './services/project.service';
import { ReportService } from './services/report.service';
import { UserService } from './services/user.service';

@Controller()
export class AuditController {
	constructor(
		@Inject(ReportService) private readonly report: ReportService,
		@Inject(FavoriteService) private readonly favorite: FavoriteService,
		@Inject(ProjectService) private readonly project: ProjectService,
		@Inject(UserService) private readonly user: UserService,
	) {}

	@NoContent()
	@Pattern('health_check')
	async healthCheck() {
		return true;
	}

	@NoContent()
	@Pattern('create_report_creator')
	async createReportCreator(
		@Payload() dto: UserToCreatorAction<TCreateReportCreator>,
	) {
		return this.report.createReportCreator(dto);
	}

	@NoContent()
	@Pattern('create_report_project')
	async createReportProject(
		@Payload() dto: UserToProjectAction<TCreateReportProject>,
	) {
		return this.report.createReportProject(dto);
	}

	@NoContent()
	@Pattern('create_favorite_creator')
	async createFavoriteCreator(@Payload() dto: UserToCreatorAction) {
		return this.favorite.createFavoriteCreator(dto.userId, dto.creatorId);
	}

	@NoContent()
	@Pattern('create_favorite_project')
	async createFavoriteProject(@Payload() dto: UserToProjectAction) {
		return this.favorite.createFavoriteProject(dto.userId, dto.projectId);
	}

	@NoContent()
	@Pattern('update_user')
	async updateUser(@Payload() dto: UserAction<TUpdateUser>) {
		return this.user.updateUser(dto);
	}

	@NoContent()
	@Pattern('delete_favorite_creator')
	async deleteFavoriteCreator(@Payload() dto: UserToCreatorAction) {
		return this.favorite.deleteFavoriteCreator(dto.userId, dto.creatorId);
	}

	@NoContent()
	@Pattern('delete_favorite_project')
	async deleteFavoriteProject(@Payload() dto: UserToProjectAction) {
		return this.favorite.deleteFavoriteProject(dto.userId, dto.projectId);
	}

	@NoContent()
	@Pattern('delete_project')
	async deleteProject(@Payload() dto: UserToProjectAction) {
		return this.project.deleteProject(dto.projectId, dto.userId);
	}

	@Pattern('list_favorite_creator')
	async listFavoriteCreator(
		@Payload() {
			userId,
			...dto
		}: UserAction<Omit<TPagination, 'order' | 'search'>>,
	) {
		return this.favorite.listFavoriteCreator(userId, dto);
	}

	@Pattern('list_favorite_project')
	async listFavoriteProject(
		@Payload() {
			userId,
			...dto
		}: UserAction<Omit<TPagination, 'order' | 'search'>>,
	) {
		return this.favorite.listFavoriteProject(userId, dto);
	}
}

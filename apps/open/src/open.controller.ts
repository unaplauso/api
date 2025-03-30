import { Controller, Inject } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { NoContent } from '@unaplauso/common/decorators';
import type { TListProject, TPagination } from '@unaplauso/validation/types';
import { Pattern } from './decorators/pattern.decorator';
import { ProjectService } from './services/project.service';
import { TopicService } from './services/topic.service';
import { UserService } from './services/user.service';

@Controller()
export class OpenController {
	constructor(
		@Inject(UserService) private readonly user: UserService,
		@Inject(TopicService) private readonly topic: TopicService,
		@Inject(ProjectService) private readonly project: ProjectService,
	) {}

	@NoContent()
	@Pattern('health_check')
	async healthCheck() {
		return true;
	}

	@Pattern('read_project')
	async readProject(@Payload() id: number) {
		return this.project.readProject(id);
	}

	@Pattern('read_user_profile_pic')
	async readUserProfilePic(@Payload() userId: number) {
		return this.user.readUserProfilePic(userId);
	}

	@Pattern('read_user_profile_banner')
	async readUserProfileBanner(@Payload() userId: number) {
		return this.user.readUserProfileBanner(userId);
	}

	@Pattern('read_user_exists')
	async readUserExists(@Payload() username: string) {
		return this.user.readUserExists(username);
	}

	@Pattern('list_topic')
	async listTopic(@Payload() dto: Omit<TPagination, 'order'>) {
		return this.topic.listTopic(dto);
	}

	@Pattern('list_project')
	async listProject(@Payload() dto: TListProject) {
		return this.project.listProject(dto);
	}
}

import { Controller, Inject } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { NoContent } from '@unaplauso/common/decorators';
import type { CreatorAction, ProjectAction } from '@unaplauso/validation';
import type {
	ListCreator,
	ListDonation,
	ListProject,
	ListTopDonation,
	Pagination,
} from '@unaplauso/validation/types';
import { Pattern } from './decorators/pattern.decorator';
import { CreatorService } from './services/creator.service';
import { DonationService } from './services/donation.service';
import { ProjectService } from './services/project.service';
import { TopicService } from './services/topic.service';
import { UserService } from './services/user.service';

@Controller()
export class OpenController {
	constructor(
		@Inject(UserService) private readonly user: UserService,
		@Inject(TopicService) private readonly topic: TopicService,
		@Inject(ProjectService) private readonly project: ProjectService,
		@Inject(CreatorService) private readonly creator: CreatorService,
		@Inject(DonationService) private readonly donation: DonationService,
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

	@Pattern('read_creator')
	async readCreator(@Payload() idOrUsername: string | number) {
		return this.creator.readCreator(idOrUsername);
	}

	@Pattern('read_creator_custom_thanks')
	async readCreatorCustomThanks(@Payload() idOrUsername: string | number) {
		return this.creator.readCreatorCustomThanks(idOrUsername);
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
	async listTopic(@Payload() dto: Omit<Pagination, 'order'>) {
		return this.topic.listTopic(dto);
	}

	@Pattern('list_project')
	async listProject(@Payload() dto: ListProject) {
		return this.project.listProject(dto);
	}

	@Pattern('list_creator')
	async listCreator(@Payload() dto: ListCreator) {
		return this.creator.listCreator(dto);
	}

	@Pattern('list_creator_donation')
	async listCreatorDonation(@Payload() dto: CreatorAction<ListDonation>) {
		return this.donation.listCreatorDonation(dto);
	}

	@Pattern('list_top_creator_donation')
	async listTopCreatorDonation(@Payload() dto: CreatorAction<ListTopDonation>) {
		return this.donation.listTopCreatorDonation(dto);
	}

	@Pattern('list_project_donation')
	async listProjectDonation(@Payload() dto: ProjectAction<ListDonation>) {
		return this.donation.listProjectDonation(dto);
	}

	@Pattern('list_top_project_donation')
	async listTopProjectDonation(@Payload() dto: ProjectAction<ListTopDonation>) {
		return this.donation.listTopProjectDonation(dto);
	}
}

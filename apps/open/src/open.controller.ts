import { Controller } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { NoContent } from '@unaplauso/services';
import { Pagination } from '@unaplauso/validation/dtos';
import { Pattern } from './decorators/pattern.decorator';
import { TopicService } from './services/topic.service';
import { UserService } from './services/user.service';

@Controller()
export class OpenController {
  constructor(
    private readonly user: UserService,
    private readonly topic: TopicService,
  ) {}

  @NoContent()
  @Pattern('health_check')
  async healthCheck() {
    return true;
  }

  @Pattern('read_user_profile_pic')
  async readUserProfilePic(@Payload() userId: number) {
    return this.user.readUserProfilePic(userId);
  }

  @Pattern('read_user_profile_banner')
  async readUserProfileBanner(@Payload() userId: number) {
    return this.user.readUserProfileBanner(userId);
  }

  @Pattern('list_topic')
  async listTopic(@Payload() dto: Omit<Pagination, 'order'>) {
    return this.topic.listTopic(dto);
  }
}

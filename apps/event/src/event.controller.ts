import { Controller } from '@nestjs/common';
import { Pattern } from './decorators/pattern.decorator';
import { EventService } from './event.service';

@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Pattern('health_check')
  async healthCheck() {
    return true;
  }

  // TODO: cron que borre interactions si son mas de x
}

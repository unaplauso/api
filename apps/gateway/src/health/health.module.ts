import { Module } from '@nestjs/common';
import { DatabaseModule } from '@unaplauso/database';
import { InternalModule } from '@unaplauso/services';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [InternalModule, DatabaseModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}

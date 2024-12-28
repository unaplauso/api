import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditController } from './audit.controller';
import { AppService } from './audit.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AuditController],
  providers: [AppService],
})
export class AuditModule {}

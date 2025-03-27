import { Module } from '@nestjs/common';
import { LocalConfigModule } from '@unaplauso/common/modules';
import { DatabaseModule } from '@unaplauso/database/module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
	imports: [LocalConfigModule(), DatabaseModule],
	controllers: [PaymentController],
	providers: [PaymentService],
})
export class PaymentModule {}

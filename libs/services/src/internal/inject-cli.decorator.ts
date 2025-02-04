import { Inject } from '@nestjs/common';
import { InternalService } from './internal.service';

export const InjectCLI = () => Inject(InternalService);

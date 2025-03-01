import { Inject } from '@nestjs/common';
import { InternalService } from './internal.service';

export const InjectClient = () => Inject(InternalService);

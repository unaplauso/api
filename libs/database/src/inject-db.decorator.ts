import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from './database.module';

export const InjectDB = () => Inject(DATABASE_CONNECTION);

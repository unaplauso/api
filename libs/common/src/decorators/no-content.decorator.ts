import { HttpCode, HttpStatus } from '@nestjs/common';
import { IS_DEVELOPMENT } from '../validation';

export const NoContent = () =>
  HttpCode(IS_DEVELOPMENT ? HttpStatus.OK : HttpStatus.NO_CONTENT);

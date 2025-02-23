import { HttpCode, HttpStatus } from '@nestjs/common';

export const NoContent = () => HttpCode(HttpStatus.NO_CONTENT);

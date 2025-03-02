import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export const NoContent = () =>
  applyDecorators(
    ApiResponse({ status: HttpStatus.NO_CONTENT }),
    HttpCode(HttpStatus.NO_CONTENT),
  );

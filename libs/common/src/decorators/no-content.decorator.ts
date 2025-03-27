import {
	HttpCode,
	HttpStatus,
	SetMetadata,
	applyDecorators,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export const NO_CONTENT_KEY = 'no-content';

export const NoContent = () =>
	applyDecorators(
		ApiResponse({ status: HttpStatus.NO_CONTENT }),
		SetMetadata(NO_CONTENT_KEY, true),
		HttpCode(HttpStatus.NO_CONTENT),
	);

import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { ApiConsumes } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
	ApiFileBody,
	FileInterceptor,
} from '@webundsoehne/nest-fastify-file-upload';

export const ReceivesFile = (key = 'file') =>
	applyDecorators(
		ApiConsumes('multipart/form-data'),
		ApiFileBody(key),
		UseInterceptors(FileInterceptor(key)),
		Throttle({ default: { limit: 2, ttl: 10000, blockDuration: 15000 } }),
	);

import { applyDecorators } from '@nestjs/common';
import { MessagePattern, type PatternMetadata } from '@nestjs/microservices';
import { Service } from '@unaplauso/services';

export const Pattern = (cmd: string, override?: PatternMetadata) =>
	applyDecorators(
		MessagePattern({ service: Service.PAYMENT, cmd, ...(override as object) }),
	);

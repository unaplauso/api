import { applyDecorators } from '@nestjs/common';
import { MessagePattern, type PatternMetadata } from '@nestjs/microservices';
import { Service } from '@unaplauso/services';

export const Pattern = (cmd: string, override?: PatternMetadata) =>
	applyDecorators(
		MessagePattern({ service: Service.AUDIT, cmd, ...(override as object) }),
	);

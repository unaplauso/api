import { type ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { IS_DEVELOPMENT } from '@unaplauso/validation';
import type { FastifyReply } from 'fastify';

@Catch()
export class ClientErrorFilter extends BaseExceptionFilter {
	private readonly logger = new Logger(ClientErrorFilter.name);

	catch(
		e: { status?: number; response: { statusCode?: number } },
		host: ArgumentsHost,
	) {
		const code = (e?.response?.statusCode ?? e?.status) || 500;
		this.logger.error(e);
		return host
			.switchToHttp()
			.getResponse<FastifyReply>()
			.status(code)
			.send(IS_DEVELOPMENT ? { ...e } : undefined);
	}
}
